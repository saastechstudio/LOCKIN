import { LOCKIN_TAGS } from "@/lib/social/data";

/** Vocabulaire et bornes du module Formation — un seul endroit, serveur et client. */
export const FORMATION_THEMES = LOCKIN_TAGS;

export const FORMATION_LEVELS = ["debutant", "intermediaire", "avance"] as const;
export type FormationLevel = (typeof FORMATION_LEVELS)[number];
export const FORMATION_LEVEL_LABELS: Record<FormationLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const RESOURCE_TYPES = ["text", "video", "audio", "pdf"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  text: "Texte",
  video: "Vidéo",
  audio: "Audio",
  pdf: "PDF",
};

export const FORMATION_LIMITS = {
  title: 120,
  description: 2000,
  modules: 30,
  chaptersPerModule: 40,
  resourcesPerChapter: 15,
  textContent: 20_000,
  urlContent: 500,
  maxHours: 500,
  maxPriceEuros: 10_000,
  question: 1500,
  answer: 3000,
  pageSize: 12,
} as const;

/** Prix en centimes → « 49 € » ; null ou 0 → « Gratuite ». */
export function formatPrice(priceCents: number | null | undefined): string {
  if (!priceCents) return "Gratuite";
  const euros = priceCents / 100;
  return `${Number.isInteger(euros) ? euros : euros.toFixed(2).replace(".", ",")} €`;
}

/**
 * Lecteur natif seulement pour un fichier média direct (https + extension
 * connue) ; tout le reste (YouTube, Vimeo, Drive…) s'ouvre par un lien.
 * Aucune iframe tierce n'est injectée dans la page.
 */
export function nativeMediaKind(type: string, url: string): "video" | "audio" | null {
  let pathname = "";
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    return null;
  }
  if (type === "video" && /\.(mp4|webm|ogv)$/.test(pathname)) return "video";
  if (type === "audio" && /\.(mp3|m4a|ogg|oga|wav)$/.test(pathname)) return "audio";
  return null;
}

/** Vérification des créateurs : bornes partagées entre le formulaire et l'action serveur. */
export const CREATOR_VERIFICATION_LIMITS = {
  legalName: 120,
  presentationMin: 40,
  presentation: 800,
  proofUrl: 300,
  decisionNote: 500,
} as const;

export const CREATOR_STATUS_LABELS = {
  none: "Non vérifié",
  pending: "En cours d'examen",
  approved: "Créateur vérifié",
  rejected: "Demande refusée",
} as const;

export type CreatorStatus = keyof typeof CREATOR_STATUS_LABELS;
