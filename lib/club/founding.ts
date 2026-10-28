/**
 * Cercle fondateur. Source unique des chiffres affichés (jauge du hero,
 * mur de points, carte de membre). Mettre `taken` à jour à chaque adhésion
 * validée : la page n'affiche jamais un chiffre qui ne vient pas d'ici.
 */
export const FOUNDING_CIRCLE = {
  total: 100,
  taken: 0,
} as const;

export function foundingSeatsLeft() {
  return Math.max(0, FOUNDING_CIRCLE.total - FOUNDING_CIRCLE.taken);
}
