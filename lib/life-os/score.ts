/**
 * LockIn Score : un chiffre de 0 à 100, recalculé chaque jour, que le membre
 * a envie de faire monter. C'est l'intensité lumineuse du noyau de sa
 * SphereLife. Cinq composantes, toutes tirées de ce qu'il a réellement fait :
 *
 * - Discipline  : sa note de discipline (1–10), moyennée sur 7 jours glissants ;
 * - Régularité  : jours actifs sur les 7 derniers ;
 * - Cohérence   : ce qu'il a prévu face à ce qu'il a fait aujourd'hui
 *                 (habitudes tenues, temps de focus, priorité bouclée) ;
 * - Progression : tâches et jalons d'objectifs franchis sur 7 jours ;
 * - Équilibre   : répartition de l'énergie entre ses sphères de vie.
 *
 * Module pur : aucune dépendance à la base, testé dans score.test.ts.
 */

export type DayActivity = {
  /** Jour concerné, à minuit (heure du serveur). */
  date: Date;
  /** Note de discipline du jour (1–10), ou null si le membre ne l'a pas donnée. */
  disciplineRating: number | null;
  habitsDone: number;
  habitsTotal: number;
  focusMinutes: number;
  /** Tâches d'objectifs bouclées ce jour-là. */
  goalTasksCompleted: number;
  milestonesCompleted: number;
  /** Priorité du jour (focus quotidien) tenue. */
  priorityDone: boolean;
  /** Toute autre trace d'activité (check-in, routine cochée, session…). */
  otherActivity: boolean;
};

export type ScoreComponents = {
  discipline: number;
  regularity: number;
  coherence: number;
  progress: number;
  /** null avec moins de deux sphères de vie : la composante sort du calcul. */
  balance: number | null;
};

export type DayScore = {
  date: Date;
  score: number;
  components: ScoreComponents;
};

export const SCORE_WEIGHTS = {
  discipline: 0.25,
  regularity: 0.2,
  coherence: 0.2,
  progress: 0.2,
  balance: 0.15,
} as const;

/** Temps de focus qui vaut une journée pleine (3 h de travail profond). */
export const FOCUS_TARGET_MINUTES = 180;

const WINDOW = 7;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function isActiveDay(day: DayActivity): boolean {
  return (
    day.disciplineRating !== null ||
    day.habitsDone > 0 ||
    day.focusMinutes > 0 ||
    day.goalTasksCompleted > 0 ||
    day.milestonesCompleted > 0 ||
    day.priorityDone ||
    day.otherActivity
  );
}

/** Productivité du jour : 70 % temps de focus, 30 % actions bouclées (3 suffisent). */
export function productivityOf(day: DayActivity, targetMinutes = FOCUS_TARGET_MINUTES): number {
  const actions = day.goalTasksCompleted + day.milestonesCompleted + (day.priorityDone ? 1 : 0);
  const focus = Math.min(1, day.focusMinutes / targetMinutes) * 70;
  return clamp(Math.round(focus + (Math.min(actions, 3) / 3) * 30));
}

/** Focus Score : la part du temps de travail profond visé, atteinte aujourd'hui. */
export function focusScore(minutes: number, targetMinutes = FOCUS_TARGET_MINUTES): number {
  return clamp(Math.round((minutes / targetMinutes) * 100));
}

/** Cohérence du jour : moyenne des habitudes tenues (s'il y en a) et de la productivité. */
export function coherenceOf(day: DayActivity): number {
  const productivity = productivityOf(day);
  if (day.habitsTotal === 0) return productivity;
  const habits = (day.habitsDone / day.habitsTotal) * 100;
  return clamp(Math.round((habits + productivity) / 2));
}

/**
 * Scores jour par jour. `days` doit être trié du plus ancien au plus récent
 * et sans trou ; les 6 premiers jours servent de fenêtre glissante, les
 * scores sont rendus pour les jours à partir de `fromIndex`. `balance` est
 * l'équilibre actuel des sphères (null sans sphère à comparer).
 */
export function computeDailyScores(
  days: DayActivity[],
  fromIndex = 0,
  balance: number | null = null,
): DayScore[] {
  return days.slice(fromIndex).map((day, offset) => {
    const index = fromIndex + offset;
    const window = days.slice(Math.max(0, index - WINDOW + 1), index + 1);

    const ratings = window
      .map((d) => d.disciplineRating)
      .filter((r): r is number => r !== null);
    const discipline =
      ratings.length === 0
        ? 0
        : clamp(Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10));

    const regularity = clamp(Math.round((window.filter(isActiveDay).length / WINDOW) * 100));

    const coherence = coherenceOf(day);

    const tasks = window.reduce((sum, d) => sum + d.goalTasksCompleted, 0);
    const milestones = window.reduce((sum, d) => sum + d.milestonesCompleted, 0);
    const progress = clamp(tasks * 10 + milestones * 25);

    const components: ScoreComponents = { discipline, regularity, coherence, progress, balance };
    return { date: day.date, score: weightedScore(components), components };
  });
}

/** Moyenne pondérée ; sans équilibre mesurable, son poids est réparti sur les autres. */
export function weightedScore(c: ScoreComponents): number {
  const parts: [number, number][] = [
    [c.discipline, SCORE_WEIGHTS.discipline],
    [c.regularity, SCORE_WEIGHTS.regularity],
    [c.coherence, SCORE_WEIGHTS.coherence],
    [c.progress, SCORE_WEIGHTS.progress],
  ];
  if (c.balance !== null) parts.push([c.balance, SCORE_WEIGHTS.balance]);
  const weight = parts.reduce((sum, [, w]) => sum + w, 0);
  return clamp(Math.round(parts.reduce((sum, [v, w]) => sum + v * w, 0) / weight));
}

export type ScoreTier = { label: string; tone: "gold" | "blue" | "stone" | "coral" };

export function scoreTier(score: number): ScoreTier {
  if (score >= 85) return { label: "Locked In", tone: "gold" };
  if (score >= 70) return { label: "En contrôle", tone: "blue" };
  if (score >= 50) return { label: "En construction", tone: "blue" };
  if (score >= 30) return { label: "En réveil", tone: "stone" };
  return { label: "À relancer", tone: "coral" };
}

export const COMPONENT_LABELS: Record<keyof ScoreComponents, string> = {
  discipline: "Discipline",
  regularity: "Régularité",
  coherence: "Cohérence",
  progress: "Progression",
  balance: "Équilibre",
};

/** Composante précédée de son article, pour les phrases du copilote (« l'équilibre », « la discipline »). */
export const COMPONENT_WITH_ARTICLE: Record<keyof ScoreComponents, string> = {
  discipline: "la discipline",
  regularity: "la régularité",
  coherence: "la cohérence",
  progress: "la progression",
  balance: "l'équilibre",
};

/** Composante la plus faible : là où le copilote doit pousser en premier. */
export function weakestComponent(c: ScoreComponents): keyof ScoreComponents {
  const entries = (Object.entries(c) as [keyof ScoreComponents, number | null][]).filter(
    (entry): entry is [keyof ScoreComponents, number] => entry[1] !== null,
  );
  return entries.reduce((min, entry) => (entry[1] < min[1] ? entry : min))[0];
}
