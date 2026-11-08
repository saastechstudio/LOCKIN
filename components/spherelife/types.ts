/** Données d'une planète de la SphereLife, telles que la scène les affiche. */
export type UniverseSphere = {
  id: number;
  name: string;
  color: string;
  /** Ordre de priorité : 0 = orbite la plus proche du noyau. */
  position: number;
  orbitAngle: number;
  progress: number;
  energy: number;
  score: number;
  level: number;
  idleDays: number | null;
  effortShare: number;
  goalCount: number;
  habitCount: number;
};

export type UniverseLink = { id: number; from: number; to: number };
