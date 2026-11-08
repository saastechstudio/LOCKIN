import type { UniverseSphere } from "@/components/spherelife/types";
import type { SphereView } from "./snapshot";

/** Sphères de l'instantané → planètes de la scène SphereLife. */
export function toUniverse(
  spheres: SphereView[],
  contacts: Record<number, { id: number; name: string }[]> = {},
): UniverseSphere[] {
  return spheres.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    position: s.position,
    orbitAngle: s.orbitAngle,
    progress: s.stats.progress,
    energy: s.stats.energy,
    score: s.stats.score,
    level: s.stats.level,
    idleDays: s.stats.idleDays,
    effortShare: s.stats.effortShare,
    goalCount: s.goalCount,
    habitCount: s.habitCount,
    contacts: contacts[s.id] ?? [],
  }));
}
