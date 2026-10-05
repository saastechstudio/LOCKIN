import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { moderationEvents, users, type User } from "@/lib/db/schema";
import { checkContent, LOCKIN_MODERATION_MESSAGE } from "./filter";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Strike 1 → avertissement, 2 → 24h, 3 → 7 jours, 4+ → bannissement. */
const STRIKE_ACTIONS = ["warning", "block_24h", "suspend_7d", "ban"] as const;
type StrikeAction = (typeof STRIKE_ACTIONS)[number];

function actionForStrikeCount(count: number): StrikeAction {
  return STRIKE_ACTIONS[Math.min(count, STRIKE_ACTIONS.length) - 1];
}

export class ModerationBlockedError extends Error {}
export class AccountSuspendedError extends Error {}
export class NotClubMemberError extends Error {}

/**
 * Le club est réservé aux membres qui ont fait le rituel d'inscription.
 * Les pages le vérifient, mais une Server Action s'appelle directement :
 * chaque écriture sociale le revérifie ici.
 */
export function assertClubMember(user: User): void {
  if (!user.lockinOnboardingCompletedAt) {
    throw new NotClubMemberError("Termine ton rituel d'inscription pour participer au club.");
  }
}

/** Barrière d'entrée : un compte banni ou suspendu ne peut rien publier. */
export function assertNotSuspended(user: User): void {
  if (user.bannedAt) {
    throw new AccountSuspendedError("Ton compte Lockin a été banni pour non-respect de la charte.");
  }
  if (user.suspendedUntil && user.suspendedUntil.getTime() > Date.now()) {
    const until = user.suspendedUntil.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    throw new AccountSuspendedError(`Ton compte est suspendu jusqu'au ${until}.`);
  }
}

/**
 * Enregistre un événement de modération et escalade la sanction du
 * compte (strike + score de respect + éventuelle suspension/ban).
 */
export async function applyStrike(
  userId: number,
  source: "auto_filter" | "report" | "manual",
  reason: string,
  contentSnapshot?: string,
): Promise<{ action: StrikeAction; strikeCount: number }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("Utilisateur introuvable");

  const strikeCount = user.strikeCount + 1;
  const action = actionForStrikeCount(strikeCount);
  const penalty = source === "report" ? 20 : 10;
  const respectScore = Math.max(0, user.respectScore - penalty);
  const now = Date.now();

  await db
    .update(users)
    .set({
      strikeCount,
      respectScore,
      suspendedUntil:
        action === "block_24h"
          ? new Date(now + DAY)
          : action === "suspend_7d"
            ? new Date(now + 7 * DAY)
            : user.suspendedUntil,
      bannedAt: action === "ban" ? new Date(now) : user.bannedAt,
    })
    .where(eq(users.id, userId));

  await db.insert(moderationEvents).values({
    userId,
    source,
    reason,
    contentSnapshot,
    action,
  });

  return { action, strikeCount };
}

/**
 * À appeler avant toute insertion de contenu généré par l'utilisateur
 * (post, commentaire, message, réponse d'entraide). Lève une erreur —
 * avec le message Lockin — si le contenu est bloqué ou le compte
 * sanctionné ; ne lève rien et ne fait rien si tout est en ordre.
 */
export async function moderateOrThrow(
  user: User,
  text: string,
  { allowNonMember = false }: { allowNonMember?: boolean } = {},
): Promise<void> {
  // Seul le rituel d'inscription publie avant que l'adhésion soit acquise.
  if (!allowNonMember) assertClubMember(user);
  assertNotSuspended(user);

  const verdict = checkContent(text);
  if (!verdict.blocked) return;

  await applyStrike(user.id, "auto_filter", verdict.reason ?? "insulte", text);
  throw new ModerationBlockedError(LOCKIN_MODERATION_MESSAGE);
}
