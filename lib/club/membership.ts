/**
 * Adhésion au Lockin Social Club. Source unique des conditions affichées
 * sur le site : le club est réservé aux membres du Lockin Trip, la première
 * année est offerte, puis l'adhésion est annuelle.
 */
export const MEMBERSHIP = {
  /** Mois offerts après le Lockin Trip. */
  freeMonths: 12,
  /** Prix annuel ensuite, en euros TTC. */
  yearlyPriceEur: 49,
} as const;

/** Page du Lockin Trip, pour ceux qui ne l'ont pas encore fait. */
export const LOCKIN_TRIP_HREF = "/camp";

/** Entrée du club pour un membre du Lockin Trip. */
export const JOIN_HREF = "/rejoindre";

export const PRICE_LABEL = `${MEMBERSHIP.yearlyPriceEur} €`;
