/**
 * Catalogue des challenges Lockin — 7 ou 30 jours. Même logique que les
 * groupes : liste fixe, insérée en base de façon idempotente (slug unique).
 */
export type ChallengeSeed = {
  slug: string;
  title: string;
  description: string;
  durationDays: 7 | 30;
};

export const CHALLENGES_SEED: ChallengeSeed[] = [
  {
    slug: "reveil-fixe-7",
    title: "Réveil à heure fixe",
    description: "Sept jours debout à la même heure, week-end compris.",
    durationDays: 7,
  },
  {
    slug: "matin-sans-reseaux-7",
    title: "Matin sans réseaux",
    description: "Aucun réseau social avant midi, sept jours d'affilée.",
    durationDays: 7,
  },
  {
    slug: "sport-quotidien-7",
    title: "Sport quotidien",
    description: "Trente minutes d'effort physique par jour pendant sept jours.",
    durationDays: 7,
  },
  {
    slug: "deep-work-30",
    title: "Deep work",
    description: "Deux heures de travail profond par jour, sans notification, trente jours.",
    durationDays: 30,
  },
  {
    slug: "lecture-30",
    title: "Lecture",
    description: "Vingt minutes de lecture chaque jour pendant trente jours.",
    durationDays: 30,
  },
  {
    slug: "sans-sucre-30",
    title: "Sans sucre ajouté",
    description: "Trente jours sans sucre ajouté. Lire les étiquettes fait partie du combat.",
    durationDays: 30,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Jour courant du challenge (1 = jour de départ). */
export function challengeDayIndex(startedOn: Date, today: Date = startOfDay()): number {
  return Math.floor((startOfDay(today).getTime() - startOfDay(startedOn).getTime()) / DAY_MS) + 1;
}
