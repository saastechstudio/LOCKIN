/**
 * Anti-spam de la messagerie : heuristiques pures appliquées avant l'envoi,
 * en complément de la limite de débit et du filtre de langage. Aucune
 * dépendance à la base : l'appelant passe les derniers messages du membre.
 * Testé dans spam.test.ts.
 */

export type RecentMessage = { body: string; createdAt: Date };

export type SpamVerdict = { blocked: false } | { blocked: true; reason: string };

const LINK = /https?:\/\/|www\./gi;
const MAX_LINKS = 3;
const DUPLICATE_WINDOW_MS = 10 * 60_000;
const MAX_DUPLICATES = 2;
const BURST_WINDOW_MS = 10_000;
const MAX_BURST = 5;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function countLinks(body: string): number {
  return body.match(LINK)?.length ?? 0;
}

/** Un message qui ne fait que répéter un seul caractère ou un seul mot, longuement. */
function isGibberish(body: string): boolean {
  const text = normalize(body);
  if (text.length < 24) return false;
  if (/^(.)\1{15,}$/u.test(text.replace(/\s/g, ""))) return true;
  const words = text.split(" ");
  return words.length >= 8 && new Set(words).size === 1;
}

export function checkSpam(body: string, recent: RecentMessage[], now: Date = new Date()): SpamVerdict {
  if (countLinks(body) > MAX_LINKS) {
    return { blocked: true, reason: "Trop de liens dans un seul message." };
  }
  if (isGibberish(body)) {
    return { blocked: true, reason: "Ce message ressemble à du bruit." };
  }
  const normalized = normalize(body);
  const duplicates = recent.filter(
    (m) => now.getTime() - m.createdAt.getTime() < DUPLICATE_WINDOW_MS && normalize(m.body) === normalized,
  ).length;
  if (normalized.length > 12 && duplicates >= MAX_DUPLICATES) {
    return { blocked: true, reason: "Tu as déjà envoyé ce message plusieurs fois." };
  }
  const burst = recent.filter((m) => now.getTime() - m.createdAt.getTime() < BURST_WINDOW_MS).length;
  if (burst >= MAX_BURST) {
    return { blocked: true, reason: "Doucement : tu envoies trop vite." };
  }
  return { blocked: false };
}
