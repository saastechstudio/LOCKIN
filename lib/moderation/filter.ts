/**
 * Filtrage automatique du langage — appliqué aux posts, commentaires,
 * messages privés et réponses d'entraide (cf. lib/moderation/enforce.ts).
 *
 * Volontairement simple côté "vulgarité/insultes" (une liste statique) et
 * basé sur des motifs côté "discrimination/menace" (une phrase plutôt
 * qu'un mot isolé — moins de faux positifs, pas besoin de lister des
 * insultes ciblées mot pour mot). Une vraie modération de production
 * brancherait en plus un service de détection de toxicité (Perspective
 * API, OpenAI moderation…) ; ce module reste la ligne de base qui
 * fonctionne sans dépendance externe.
 */

const FORBIDDEN_WORDS = [
  "con",
  "conne",
  "connard",
  "connasse",
  "idiot",
  "idiote",
  "abruti",
  "abrutie",
  "debile",
  "cretin",
  "cretine",
  "imbecile",
  "pute",
  "putain",
  "salope",
  "encule",
  "enculee",
  "batard",
  "batarde",
  "merde",
  "nique",
  "ntm",
  "ta gueule",
  "fdp",
  "connerie",
  "pourriture",
  "ordure",
];

const DISCRIMINATION_PATTERNS: RegExp[] = [
  /\b(sale|stupide|pauvre|degenere|degenerer)s?\s+(arabe|juif|juive|noir|noire|blanc|blanche|asiatique|musulman|musulmane|chretien|chretienne|homo|gay|lesbienne|handicape|handicapee)s?\b/,
  /\bretourne\s+(dans|chez)\s+ton\s+pays\b/,
  /\b(tous|toutes)\s+les\s+(arabes|juifs|noirs|blancs|asiatiques|musulmans|femmes|homos)\s+(sont|devraient)\b/,
];

const THREAT_PATTERNS: RegExp[] = [
  /\bje\s+(vais|vais\s+te)\s+(tuer|frapper|niquer|detruire|retrouver)\b/,
  /\bva\s+(te\s+)?(suicider|crever|mourir)\b/,
  /\bje\s+sais\s+ou\s+tu\s+habites\b/,
];

/** Minuscules, sans accents — pour matcher peu importe la casse ou les accents. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export type ContentVerdict = {
  blocked: boolean;
  reason?: "menace" | "discrimination" | "insulte";
  flaggedWords?: string[];
};

export function checkContent(raw: string): ContentVerdict {
  const text = normalize(raw);

  if (THREAT_PATTERNS.some((pattern) => pattern.test(text))) {
    return { blocked: true, reason: "menace" };
  }
  if (DISCRIMINATION_PATTERNS.some((pattern) => pattern.test(text))) {
    return { blocked: true, reason: "discrimination" };
  }

  const flaggedWords = FORBIDDEN_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`).test(text),
  );
  if (flaggedWords.length > 0) {
    return { blocked: true, reason: "insulte", flaggedWords };
  }

  return { blocked: false };
}

export const LOCKIN_MODERATION_MESSAGE =
  "Ce contenu ne correspond pas à l'éthique Lockin. Merci de rester respectueux.";

/**
 * Heuristique de ton agressif pour le mode "Respect Lockin" — pop-up
 * affiché côté client avant l'envoi d'un message qui semble agressif,
 * sans bloquer l'envoi (contrairement à checkContent côté serveur).
 */
export function seemsAggressive(raw: string): boolean {
  if (checkContent(raw).blocked) return true;

  const letters = raw.replace(/[^a-zA-Zà-ÿÀ-ß]/g, "");
  const upper = letters.replace(/[^A-ZÀ-ß]/g, "");
  const capsRatio = letters.length >= 6 ? upper.length / letters.length : 0;
  const exclamationCount = (raw.match(/!/g) ?? []).length;

  return capsRatio > 0.6 || exclamationCount >= 3;
}
