/**
 * Vocabulaire partagé du Lockin Social Club — mêmes tags pour les posts du
 * feed et les questions d'entraide, mêmes sports que le Lock-In Camp (une
 * seule liste canonique, cf. lib/camp/data.ts).
 */
import { SPORT_ACTIVITIES } from "@/lib/camp/data";

export { SPORT_ACTIVITIES };

export const LOCKIN_TAGS = ["Discipline", "Sport", "Business", "Mindset", "Lifestyle", "Santé"] as const;

export type LockinTag = (typeof LOCKIN_TAGS)[number];

export const LOCKIN_LEVELS = [1, 2, 3, 4, 5] as const;

/**
 * Rituel d'inscription (écran "Objectif 30 jours") — mêmes mots que
 * LOCKIN_TAGS, dans l'ordre demandé par le produit.
 */
export const GOAL_DOMAINS: readonly LockinTag[] = [
  "Santé",
  "Sport",
  "Business",
  "Discipline",
  "Mindset",
  "Lifestyle",
];

/** Domaines qui comptent comme objectif professionnel plutôt que personnel. */
export const PROFESSIONAL_GOAL_DOMAINS: readonly LockinTag[] = ["Business"];

export const MORNING_ROUTINE_CHOICES = [
  "Réveil à heure fixe",
  "Sport matinal",
  "Méditation",
  "Journaling",
  "Lecture",
  "Planification de la journée",
] as const;

export const EVENING_ROUTINE_CHOICES = [
  "Lecture",
  "Planification du lendemain",
  "Méditation",
  "Journaling",
  "Déconnexion écrans",
  "Étirements / mobilité",
] as const;

/**
 * Amorçage des groupes — même logique que CAMP_SESSIONS_SEED dans
 * lib/camp/data.ts : catalogue fixe, inséré en base de façon idempotente
 * (slug unique) par getGroups(), jamais généré à la main en prod.
 */
export type GroupSeed = {
  slug: string;
  name: string;
  type: "city" | "sport" | "profession" | "theme";
  description: string;
};

const CITY_GROUPS: GroupSeed[] = [
  { slug: "paris", name: "Paris", type: "city", description: "Le noyau Lockin à Paris." },
  { slug: "dakar", name: "Dakar", type: "city", description: "La communauté Lockin à Dakar." },
  { slug: "colombo", name: "Colombo", type: "city", description: "La communauté Lockin à Colombo." },
  { slug: "bali", name: "Bali", type: "city", description: "La communauté Lockin à Bali." },
  { slug: "mexico", name: "Mexico", type: "city", description: "La communauté Lockin à Mexico." },
  { slug: "dubai", name: "Dubai", type: "city", description: "La communauté Lockin à Dubai." },
];

const SPORT_GROUPS: GroupSeed[] = SPORT_ACTIVITIES.map((s) => ({
  slug: `sport-${s.id}`,
  name: s.name,
  type: "sport",
  description: `Pour les membres qui pratiquent le ${s.name.toLowerCase()}.`,
}));

const PROFESSION_GROUPS: GroupSeed[] = [
  { slug: "entrepreneurs", name: "Entrepreneurs", type: "profession", description: "Business, croissance, levées." },
  { slug: "createurs", name: "Créateurs", type: "profession", description: "Contenu, marque personnelle, audience." },
  { slug: "sportifs", name: "Sportifs", type: "profession", description: "Performance et discipline physique." },
  { slug: "etudiants", name: "Étudiants", type: "profession", description: "Discipline académique et premiers pas." },
];

const THEME_GROUPS: GroupSeed[] = [
  { slug: "discipline", name: "Discipline", type: "theme", description: "Routines, constance, rigueur." },
  { slug: "business", name: "Business", type: "theme", description: "Stratégie, outils, retours d'expérience." },
  { slug: "sante", name: "Santé", type: "theme", description: "Sommeil, nutrition, énergie." },
  { slug: "mindset", name: "Mindset", type: "theme", description: "Psychologie de la performance." },
];

export const GROUPS_SEED: GroupSeed[] = [
  ...CITY_GROUPS,
  ...SPORT_GROUPS,
  ...PROFESSION_GROUPS,
  ...THEME_GROUPS,
];

export const GROUP_TYPE_LABELS: Record<GroupSeed["type"], string> = {
  city: "Ville",
  sport: "Sport",
  profession: "Métier",
  theme: "Thématique",
};
