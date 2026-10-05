import "server-only";

import { UserFacingError } from "@/lib/action-result";

/**
 * Limitation de débit en mémoire, fenêtre glissante, par membre et par
 * usage. Suffisant pour une seule instance (Railway, 1 réplique) : chaque
 * redémarrage remet les compteurs à zéro, ce qui reste sans danger. Si le
 * service passe à plusieurs répliques, remplacer le stockage par Redis.
 */
const buckets = new Map<string, number[]>();

export type RateLimitRule = { limit: number; windowMs: number };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Règles par usage : généreuses pour un humain, bloquantes pour un script. */
export const RATE_LIMITS = {
  aiChat: { limit: 20, windowMs: 10 * MINUTE },
  aiAudit: { limit: 5, windowMs: HOUR },
  post: { limit: 10, windowMs: 10 * MINUTE },
  comment: { limit: 30, windowMs: 10 * MINUTE },
  message: { limit: 40, windowMs: 10 * MINUTE },
  question: { limit: 10, windowMs: HOUR },
  answer: { limit: 30, windowMs: 10 * MINUTE },
  businessOffer: { limit: 5, windowMs: HOUR },
  report: { limit: 20, windowMs: HOUR },
  reaction: { limit: 120, windowMs: 10 * MINUTE },
  camp: { limit: 10, windowMs: HOUR },
  formationCreate: { limit: 5, windowMs: HOUR },
  formationEdit: { limit: 150, windowMs: 10 * MINUTE },
  formationProgress: { limit: 200, windowMs: 10 * MINUTE },
  formationQuestion: { limit: 10, windowMs: HOUR },
  formationAnswer: { limit: 40, windowMs: 10 * MINUTE },
  creatorVerification: { limit: 3, windowMs: HOUR },
  creatorDecision: { limit: 120, windowMs: 10 * MINUTE },
} satisfies Record<string, RateLimitRule>;

export class RateLimitError extends UserFacingError {
  constructor(public readonly retryAfterSeconds: number) {
    super("Trop de tentatives en peu de temps. Réessaie dans quelques minutes.");
  }
}

/** Renvoie le délai d'attente en secondes, ou 0 si l'action est autorisée (et la compte). */
export function consumeRateLimit(key: string, rule: RateLimitRule, now = Date.now()): number {
  const since = now - rule.windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= rule.limit) {
    buckets.set(key, hits);
    return Math.max(1, Math.ceil((hits[0] + rule.windowMs - now) / 1000));
  }
  hits.push(now);
  buckets.set(key, hits);

  // Ménage occasionnel pour que la Map ne grossisse pas indéfiniment.
  if (buckets.size > 10_000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => t <= since)) buckets.delete(k);
    }
  }
  return 0;
}

export function enforceRateLimit(
  action: keyof typeof RATE_LIMITS,
  userId: number | string,
): void {
  const retryAfter = consumeRateLimit(`${action}:${userId}`, RATE_LIMITS[action]);
  if (retryAfter > 0) throw new RateLimitError(retryAfter);
}
