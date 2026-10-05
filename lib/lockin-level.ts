/**
 * Niveau Lockin : le cadenas se verrouille palier par palier.
 * Un seul calcul pour le hero de l'app, les profils et la progression.
 * Entrée : un score de discipline 0–100.
 */
export const LEVEL_MAX = 5;

const LEVEL_NAMES = ["Ouvert", "Initié", "Engagé", "Constant", "Discipliné", "Verrouillé"] as const;

const THRESHOLDS = [10, 30, 50, 70, 90]; // score minimal pour atteindre les niveaux 1 à 5

export function disciplineLevel(score: number): number {
  return THRESHOLDS.filter((t) => score >= t).length;
}

export function levelName(level: number): string {
  return LEVEL_NAMES[Math.max(0, Math.min(LEVEL_MAX, level))];
}

/** Score manquant pour le palier suivant (null au niveau maximal). */
export function pointsToNextLevel(score: number): number | null {
  const next = THRESHOLDS.find((t) => score < t);
  return next === undefined ? null : Math.ceil(next - score);
}
