/**
 * SphereLife : chaque domaine de vie est une planète. Sa progression, son
 * énergie et son score se déduisent de ce qui y est rattaché (objectifs,
 * habitudes) et de l'activité récente ; l'équilibre mesure la répartition
 * de l'énergie entre les domaines. Module pur, testé dans spheres.test.ts.
 */

/** Nuances d'émeraude et de blanc : un seul code couleur, les planètes se distinguent par leur clarté. */
export const SPHERE_PALETTE = [
  { name: "Vert lumière", value: "#4f9a53" },
  { name: "Vert profond", value: "#2d6a30" },
  { name: "Vert forêt", value: "#1e4820" },
  { name: "Menthe", value: "#9dd8a0" },
  { name: "Blanc menthe", value: "#d6efd7" },
  { name: "Blanc", value: "#FFFFFF" },
] as const;

/** Univers de départ : de quoi voir sa vie dès la première ouverture, tout se renomme ou se supprime. */
export const DEFAULT_SPHERES = [
  { name: "Business", color: "#4f9a53" },
  { name: "Santé", color: "#9dd8a0" },
  { name: "Finance", color: "#FFFFFF" },
  { name: "Relations", color: "#d6efd7" },
  { name: "Développement personnel", color: "#2d6a30" },
] as const;

export const SPHERE_SUGGESTIONS = [
  "Business",
  "Santé",
  "Sport",
  "Finance",
  "Famille",
  "Relation",
  "Développement personnel",
  "Spiritualité",
  "Voyage",
  "Création de contenu",
  "Études",
] as const;

const DAY_MS = 86_400_000;

export type SphereInput = {
  id: number;
  name: string;
  /** Progression des objectifs rattachés (0–100). */
  goalProgress: number[];
  /** Taux de réussite des habitudes rattachées sur 14 jours (0–100). */
  habitSuccess: number[];
  /** Dernière trace d'activité : tâche, jalon, session de focus, habitude notée. */
  lastActivityAt: Date | null;
  /** Effort sur 30 jours : minutes de focus + 20 min par tâche ou habitude tenue. */
  effortMinutes: number;
};

export type SphereStats = {
  id: number;
  progress: number;
  energy: number;
  score: number;
  /** 1 à 5 : taille et éclat de la planète. */
  level: number;
  idleDays: number | null;
  /** Part de l'effort total sur 30 jours (0–100). */
  effortShare: number;
};

const avg = (values: number[]) =>
  values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;

/** Énergie : 100 le jour d'une activité, puis −6 par jour sans rien, plancher 8. */
export function energyOf(lastActivityAt: Date | null, today: Date): { energy: number; idleDays: number | null } {
  if (!lastActivityAt) return { energy: 8, idleDays: null };
  const idleDays = Math.max(0, Math.floor((today.getTime() - lastActivityAt.getTime()) / DAY_MS));
  return { energy: Math.max(8, 100 - idleDays * 6), idleDays };
}

export function sphereStats(spheres: SphereInput[], today: Date): SphereStats[] {
  const totalEffort = spheres.reduce((sum, s) => sum + s.effortMinutes, 0);
  return spheres.map((sphere) => {
    const goals = avg(sphere.goalProgress);
    const habits = avg(sphere.habitSuccess);
    const progress = Math.round(goals ?? habits ?? 0);
    const { energy, idleDays } = energyOf(sphere.lastActivityAt, today);
    const consistency = habits ?? goals ?? 0;
    const score = Math.round(progress * 0.4 + energy * 0.35 + consistency * 0.25);
    return {
      id: sphere.id,
      progress,
      energy,
      score,
      level: Math.min(5, 1 + Math.floor(score / 20)),
      idleDays,
      effortShare: totalEffort === 0 ? 0 : Math.round((sphere.effortMinutes / totalEffort) * 100),
    };
  });
}

/**
 * Équilibre (0–100) : 100 quand l'énergie des sphères est homogène, plus bas
 * quand quelques domaines brillent pendant que les autres s'éteignent
 * (1 − coefficient de variation des énergies). Seules comptent les sphères
 * qui ont déjà eu une activité : un domaine tout juste créé ne déséquilibre
 * rien, et un univers vierge n'offre pas de points gratuits. null sous deux.
 */
export function balanceOf(stats: SphereStats[]): number | null {
  const lived = stats.filter((s) => s.idleDays !== null);
  if (lived.length < 2) return null;
  const energies = lived.map((s) => s.energy);
  const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
  if (mean === 0) return 0;
  const variance = energies.reduce((sum, e) => sum + (e - mean) ** 2, 0) / energies.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
}

export type SphereSignal = {
  id: string;
  tone: "positive" | "info" | "warning" | "critical";
  message: string;
  sphereId?: number;
};

/** Ce que le copilote dit de l'univers : déséquilibre, sphère qui s'éteint, effort concentré. */
export function sphereSignals(
  spheres: { id: number; name: string }[],
  stats: SphereStats[],
): SphereSignal[] {
  const byId = new Map(spheres.map((s) => [s.id, s.name]));
  const out: SphereSignal[] = [];

  const balance = balanceOf(stats);
  if (balance !== null && balance < 55) {
    out.push({ id: "imbalance", tone: "warning", message: "Ton univers est déséquilibré." });
  }

  const dominant = [...stats].sort((a, b) => b.effortShare - a.effortShare)[0];
  if (dominant && dominant.effortShare >= 60 && stats.length > 1) {
    out.push({
      id: `dominant-${dominant.id}`,
      tone: "info",
      sphereId: dominant.id,
      message: `Tu investis ${dominant.effortShare} % de ton énergie dans ${byId.get(dominant.id)}.`,
    });
  }

  for (const s of stats) {
    if (s.idleDays !== null && s.idleDays >= 7) {
      out.push({
        id: `fading-${s.id}`,
        tone: s.idleDays >= 14 ? "critical" : "warning",
        sphereId: s.id,
        message: `La sphère ${byId.get(s.id)} perd en intensité depuis ${s.idleDays} jours.`,
      });
    } else if (s.idleDays === null) {
      out.push({
        id: `empty-${s.id}`,
        tone: "info",
        sphereId: s.id,
        message: `La sphère ${byId.get(s.id)} attend son premier objectif ou sa première habitude.`,
      });
    }
    if (s.progress >= 75 && s.progress < 100) {
      out.push({
        id: `close-${s.id}`,
        tone: "positive",
        sphereId: s.id,
        message: `${byId.get(s.id)} : ${s.progress} % de tes objectifs accomplis.`,
      });
    }
  }
  const order = { critical: 0, warning: 1, info: 2, positive: 3 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}
