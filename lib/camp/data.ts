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
};

export const SPORT_ACTIVITIES: SportActivity[] = [
  { id: "football", name: "Football" },
  { id: "muay-thai", name: "Muay Thaï" },
  { id: "pilates", name: "Pilates" },
  { id: "padel", name: "Padel" },
  { id: "fitness", name: "Fitness" },
  { id: "yoga", name: "Yoga" },
];

export type Excursion = {
  id: string;
  name: string;
};

/** Une excursion incluse par séjour — cf. EXCURSIONS_TO_CHOOSE. */
export const EXCURSIONS: Excursion[] = [
  { id: "phi-phi", name: "Phi Phi Islands" },
  { id: "similan", name: "Similan Islands" },
  { id: "james-bond", name: "James Bond Island" },
  { id: "racha-coral", name: "Racha & Coral Island" },
  { id: "big-buddha", name: "Big Buddha & Temples" },
  { id: "elephant-sanctuary", name: "Elephant Sanctuary" },
  { id: "old-town", name: "Phuket Old Town" },
];

export const EXCURSIONS_TO_CHOOSE = 1;

/** Une activité fun incluse par séjour — cf. FUN_ACTIVITIES_TO_CHOOSE. */
export type FunActivity = {
  id: string;
  name: string;
};

export const FUN_ACTIVITIES: FunActivity[] = [
  { id: "jet-ski", name: "Jet Ski" },
  { id: "quad-jungle", name: "Quad Jungle" },
  { id: "kayak-grottes", name: "Kayak Grottes" },
  { id: "parachute-ascensionnel", name: "Parachute Ascensionnel" },
  { id: "zipline", name: "Zipline" },
  { id: "snorkeling-fun", name: "Snorkeling Fun" },
];

export const FUN_ACTIVITIES_TO_CHOOSE = 1;

export const CAMP_INCLUDED_ITEMS: string[] = [
  "Vol aller-retour Paris → Phuket",
  "Hébergement premium",
  "Petit-déjeuner et déjeuner",
  "Assurance voyage",
  "Activités sportives quotidiennes au choix",
  "2h de programme Lock-In par jour",
  "1 excursion incluse au choix",
  "1 activité fun incluse au choix",
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

/**
 * Le programme Lock-In officiel — 5 parties qui structurent la montée en
 * compétence sur les 10 jours (pas un simple sommaire, un vrai parcours :
 * on commence par le "pourquoi", on termine par l'ancrage durable).
 */
export type ProgramPart = {
  number: string;
  title: string;
  items: string[];
};

export const CAMP_PROGRAM_PARTS: ProgramPart[] = [
  {
    number: "01",
    title: "Pourquoi être Lock-In",
    items: [
      "Philosophie, discipline, focus, constance",
      "Vision à 90 jours",
      "Bloc inspiration + atelier introspectif",
    ],
  },
  {
    number: "02",
    title: "Comment le devenir",
    items: [
      "Méthodes Lock-In",
      "Routines, structure, outils",
      "Mise en place du système personnel",
    ],
  },
  {
    number: "03",
    title: "Devenir efficace",
    items: [
      "Gestion du temps, énergie, priorités",
      "Méthode des 3 blocs",
      "Tableau de bord personnel",
    ],
  },
  {
    number: "04",
    title: "Devenir productif",
    items: ["OKR personnels", "Automatisation des routines", "Plan d'action 30 jours"],
  },
  {
    number: "05",
    title: "Devenir Lock-In",
    items: ["Ancrage mental", "Environnement Lock-In", "Discipline durable"],
  },
];

/** Détail chronométré de la session Lock-In quotidienne (2h, le matin, 10h–12h). */
export type TimedBlock = {
  label: string;
  duration: string;
};

export const CAMP_DAILY_BLOCKS: TimedBlock[] = [
  { label: "Inspiration", duration: "30 min" },
  { label: "Atelier pratique", duration: "40 min" },
  { label: "Focus personnel", duration: "40 min" },
  { label: "Clôture", duration: "10 min" },
];

export type DayPeriod = {
  period: string;
  title: string;
  description: string;
};

export const CAMP_DAY_STRUCTURE: DayPeriod[] = [
  {
    period: "Matin · 10h–12h",
    title: "Session Lock-In (2h)",
    description: "Inspiration · Atelier pratique · Focus personnel · Clôture.",
  },
  {
    period: "Après-midi · 14h–16h",
    title: "Sport au choix",
    description: "Football, Muay Thaï, Pilates, Padel, Fitness ou Yoga.",
  },
  {
    period: "Soir",
    title: "Temps libre",
    description: "Détente, repos, ou excursion les jours où elle est programmée.",
  },
];

/** Nombre de jours (inclusif) couverts par une session. */
export function sessionDurationDays(startDate: Date, endDate: Date): number {
  const ms = endDate.getTime() - startDate.getTime();
  return Math.round(ms / 86_400_000) + 1;
}
