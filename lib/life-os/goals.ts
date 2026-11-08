/**
 * Objectifs vivants : la progression se déduit de ce qui est bouclé (jalons
 * et tâches), le rythme se compare à l'échéance. Module pur, testé dans
 * goals.test.ts.
 */

const DAY_MS = 86_400_000;

/**
 * Progression (0–100) : un jalon pèse comme trois tâches. Sans jalon ni
 * tâche, la progression manuelle reste celle saisie par le membre.
 */
export function progressFromWork(
  work: { tasksTotal: number; tasksDone: number; milestonesTotal: number; milestonesDone: number },
  manualProgress: number,
): number {
  const total = work.tasksTotal + work.milestonesTotal * 3;
  if (total === 0) return manualProgress;
  return Math.round(((work.tasksDone + work.milestonesDone * 3) / total) * 100);
}

export function deadlineOf(createdAt: Date, horizonDays: number | null): Date | null {
  if (!horizonDays) return null;
  return new Date(createdAt.getTime() + horizonDays * DAY_MS);
}

export function daysLeft(deadline: Date | null, today: Date): number | null {
  if (!deadline) return null;
  return Math.ceil((deadline.getTime() - today.getTime()) / DAY_MS);
}

/** Avancement attendu (0–100) à date, si l'effort était réparti régulièrement. */
export function expectedProgress(createdAt: Date, horizonDays: number | null, today: Date): number | null {
  if (!horizonDays) return null;
  const elapsed = (today.getTime() - createdAt.getTime()) / DAY_MS;
  return Math.max(0, Math.min(100, Math.round((elapsed / horizonDays) * 100)));
}

export type Pace = "ahead" | "on_track" | "behind" | "no_deadline";

/** Écart de 15 points ou plus avec le rythme attendu = en avance ou en retard. */
export function paceOf(progress: number, expected: number | null): Pace {
  if (expected === null) return "no_deadline";
  if (progress >= expected + 15) return "ahead";
  if (progress <= expected - 15) return "behind";
  return "on_track";
}

export const PACE_LABELS: Record<Pace, string> = {
  ahead: "En avance",
  on_track: "Dans le rythme",
  behind: "En retard",
  no_deadline: "Sans échéance",
};
