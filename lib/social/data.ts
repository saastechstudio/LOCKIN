/**
 * Vocabulaire partagé du Lockin Social Club — mêmes tags pour les posts du
 * feed et les questions d'entraide, mêmes sports que le Lock-In Camp (une
 * seule liste canonique, cf. lib/camp/data.ts).
 */
export { SPORT_ACTIVITIES } from "@/lib/camp/data";

export const LOCKIN_TAGS = ["Discipline", "Sport", "Business", "Mindset", "Lifestyle"] as const;

export type LockinTag = (typeof LOCKIN_TAGS)[number];

export const LOCKIN_LEVELS = [1, 2, 3, 4, 5] as const;
