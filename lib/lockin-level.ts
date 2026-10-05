/**
 * Niveau Lockin : le cadenas se verrouille palier par palier.
 * Un seul calcul pour le hero de l'app, les profils, le feed et la
 * progression. Il se gagne (score de discipline des 7 derniers jours),
 * il ne se déclare pas. Échelle 1–5, comme la colonne users.lockin_level.
 */
export const LEVEL_MAX = 5;

const LEVEL_NAMES = ["Initié", "Engagé", "Constant", "Discipliné", "Verrouillé"] as const;

/** Score minimal (0–100) pour atteindre les niveaux 2 à 5 ; le niveau 1 est acquis à l'entrée. */
const THRESHOLDS = [30, 50, 70, 90];

export function disciplineLevel(score: number): number {
  return 1 + THRESHOLDS.filter((t) => score >= t).length;
}

export function levelName(level: number): string {
  return LEVEL_NAMES[Math.max(1, Math.min(LEVEL_MAX, level)) - 1];
}

/** Score manquant pour le palier suivant (null au niveau maximal). */
export function pointsToNextLevel(score: number): number | null {
  const next = THRESHOLDS.find((t) => score < t);
  return next === undefined ? null : Math.ceil(next - score);
}

/** Notes de discipline quotidiennes (1–10) → score 0–100. */
export function disciplineScore(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10);
}
