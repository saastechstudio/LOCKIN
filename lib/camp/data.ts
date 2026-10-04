/**
 * Lock-In Camp — Édition Phuket 2027. Catalogue statique (sports,
 * excursions, structure de journée, inclus) et données d'amorçage des
 * sessions. Les sessions elles-mêmes vivent en base (lib/actions/camp.ts
 * les crée si absentes) pour pouvoir compter les places restantes ; le
 * reste est un catalogue fixe commun aux deux sessions.
 */

export const CAMP_DESTINATION = "Phuket";
export const CAMP_EDITION = "Édition Phuket 2027";
export const CAMP_PRICE_PER_PERSON = 2500;
export const CAMP_TOTAL_SPOTS_PER_SESSION = 20;

export type CampSessionSeed = {
  slug: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
};

export const CAMP_SESSIONS_SEED: CampSessionSeed[] = [
  {
    slug: "phuket-2027-session-1",
    name: "Session 1",
    startDate: "2027-03-08",
    endDate: "2027-03-18",
  },
  {
    slug: "phuket-2027-session-2",
    name: "Session 2",
    startDate: "2027-03-20",
    endDate: "2027-03-30",
  },
];

export type SportActivity = {
  id: string;
  name: string;
  emoji: string;
};

export const SPORT_ACTIVITIES: SportActivity[] = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "boxe-thai", name: "Boxe Thaï", emoji: "🥊" },
  { id: "padel", name: "Padel", emoji: "🎾" },
  { id: "yoga", name: "Yoga", emoji: "🧘" },
];

export type Excursion = {
  id: string;
  name: string;
  emoji: string;
};

export const EXCURSIONS: Excursion[] = [
  { id: "phi-phi", name: "Îles Phi Phi", emoji: "🏝️" },
  { id: "similan", name: "Similan Islands", emoji: "🐠" },
  { id: "james-bond", name: "James Bond Island", emoji: "🗿" },
  { id: "racha-coral", name: "Racha & Coral Island", emoji: "🪸" },
  { id: "big-buddha", name: "Big Buddha & Temples", emoji: "🙏" },
  { id: "elephant-sanctuary", name: "Elephant Sanctuary", emoji: "🐘" },
  { id: "viewpoints-marches", name: "Viewpoints & Marchés locaux", emoji: "🛍️" },
  { id: "old-town", name: "Phuket Old Town", emoji: "🏘️" },
  { id: "snorkeling", name: "Snorkeling / Plongée", emoji: "🤿" },
];

export const EXCURSIONS_TO_CHOOSE = 2;

export const CAMP_INCLUDED_ITEMS: string[] = [
  "Vol aller-retour Paris → Phuket",
  "Hébergement premium",
  "Petit-déjeuner et déjeuner",
  "Assurance voyage",
  "Activités sportives quotidiennes au choix",
  "2h de programme Lock In par jour",
  "2 excursions au choix parmi toutes les excursions de Phuket",
];

export const CAMP_PROGRAM_BLOCKS: string[] = [
  "Intervenants",
  "Innovateurs",
  "Outils",
  "Méthodes",
  "Problématiques",
  "Ateliers",
  "Études de cas",
  "Entretien individuel Lock In",
];

export type DayPeriod = {
  period: string;
  title: string;
  description: string;
};

export const CAMP_DAY_STRUCTURE: DayPeriod[] = [
  {
    period: "Matin",
    title: "Activité sportive",
    description: "Football, Boxe Thaï, Padel ou Yoga, au choix.",
  },
  {
    period: "Après-midi",
    title: "Excursion, temps libre ou récupération",
    description: "Selon le programme du jour.",
  },
  {
    period: "Fin de journée",
    title: "Session Lock In (2h)",
    description: "Inspiration & intervenant · Atelier pratique · Focus personnel & plan d'action",
  },
];

/** Nombre de jours (inclusif) couverts par une session. */
export function sessionDurationDays(startDate: Date, endDate: Date): number {
  const ms = endDate.getTime() - startDate.getTime();
  return Math.round(ms / 86_400_000) + 1;
}
