import { averageBetween, currentStreak, formatValue, type DatedValue } from "./habits";
import { expectedProgress, paceOf } from "./goals";
import { COMPONENT_WITH_ARTICLE, type ScoreComponents } from "./score";

/**
 * Insights du copilote calculés sans IA : tendances d'habitudes, objectifs à
 * l'arrêt ou en retard, temps de focus. Ils nourrissent le cockpit, les
 * « difficultés détectées » des objectifs et le contexte envoyé à l'IA.
 * Module pur, testé dans insights.test.ts.
 */

export type InsightTone = "positive" | "info" | "warning" | "critical";

export type Insight = {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
  href?: string;
  /** Objectif concerné, pour les afficher sur sa carte. */
  goalId?: number;
};

export type HabitInput = {
  id: number;
  label: string;
  target: number;
  unit: string;
  logs: DatedValue[];
};

export type GoalInput = {
  id: number;
  title: string;
  progress: number;
  createdAt: Date;
  horizonDays: number | null;
  /** Dernière tâche, jalon ou session de focus rattachée. */
  lastActivityAt: Date | null;
  openTasks: number;
};

const DAY_MS = 86_400_000;
const ORDER: Record<InsightTone, number> = { critical: 0, warning: 1, info: 2, positive: 3 };

const frNumber = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

export function habitInsights(habits: HabitInput[], today: Date): Insight[] {
  const weekStart = new Date(today.getTime() - 6 * DAY_MS);
  const prevEnd = new Date(today.getTime() - 7 * DAY_MS);
  const prevStart = new Date(today.getTime() - 13 * DAY_MS);

  return habits.flatMap((habit): Insight[] => {
    const out: Insight[] = [];
    const recent = averageBetween(habit.logs, weekStart, today);
    const previous = averageBetween(habit.logs, prevStart, prevEnd);

    if (recent !== null && previous !== null && previous > 0) {
      const change = (recent - previous) / previous;
      if (change <= -0.15) {
        out.push({
          id: `habit-down-${habit.id}`,
          tone: recent < habit.target ? "warning" : "info",
          title: `${habit.label} : en baisse`,
          detail: `${formatValue(Number(recent.toFixed(1)), habit.unit)} en moyenne cette semaine, contre ${formatValue(Number(previous.toFixed(1)), habit.unit)} la semaine d'avant.`,
          href: "/dashboard/habitudes",
        });
      } else if (change >= 0.15) {
        out.push({
          id: `habit-up-${habit.id}`,
          tone: "positive",
          title: `${habit.label} : en hausse`,
          detail: `+${Math.round(change * 100)} % par rapport à la semaine d'avant. Garde ce rythme.`,
          href: "/dashboard/habitudes",
        });
      }
    }

    const streak = currentStreak(habit.logs, habit.target, today);
    if (streak >= 3) {
      out.push({
        id: `habit-streak-${habit.id}`,
        tone: "positive",
        title: `${streak} jours d'affilée`,
        detail: `${habit.label} tenue ${streak} jours de suite. Ne casse pas la chaîne.`,
        href: "/dashboard/habitudes",
      });
    }
    return out;
  });
}

export function goalInsights(goals: GoalInput[], today: Date): Insight[] {
  return goals
    .filter((g) => g.progress < 100)
    .flatMap((goal): Insight[] => {
      const out: Insight[] = [];
      const ageDays = (today.getTime() - goal.createdAt.getTime()) / DAY_MS;
      const since = goal.lastActivityAt ?? goal.createdAt;
      const idleDays = Math.floor((today.getTime() - since.getTime()) / DAY_MS);

      if (ageDays >= 3 && idleDays >= 7) {
        out.push({
          id: `goal-idle-${goal.id}`,
          tone: "critical",
          goalId: goal.id,
          title: `« ${goal.title} » est à l'arrêt`,
          detail: `Aucune avancée depuis ${idleDays} jours. Une seule petite action aujourd'hui relance la machine.`,
          href: "/dashboard/objectifs",
        });
      }

      const expected = expectedProgress(goal.createdAt, goal.horizonDays, today);
      if (paceOf(goal.progress, expected) === "behind" && expected !== null) {
        out.push({
          id: `goal-behind-${goal.id}`,
          tone: "warning",
          goalId: goal.id,
          title: `« ${goal.title} » prend du retard`,
          detail: `${goal.progress} % accompli pour ${expected} % attendus à cette date.`,
          href: "/dashboard/objectifs",
        });
      }

      if (goal.openTasks === 0) {
        out.push({
          id: `goal-nonext-${goal.id}`,
          tone: "info",
          goalId: goal.id,
          title: `« ${goal.title} » n'a pas de prochaine action`,
          detail: "Définis la prochaine tâche, ou laisse le copilote découper l'objectif.",
          href: "/dashboard/objectifs",
        });
      }
      return out;
    });
}

export function focusInsight(weekMinutes: number, previousWeekMinutes: number): Insight | null {
  if (weekMinutes === 0 && previousWeekMinutes === 0) return null;
  const hours = (m: number) => `${frNumber(Number((m / 60).toFixed(1)))} h`;
  if (previousWeekMinutes > 0 && weekMinutes < previousWeekMinutes * 0.75) {
    return {
      id: "focus-down",
      tone: "warning",
      title: "Moins de travail profond",
      detail: `${hours(weekMinutes)} de focus sur 7 jours, contre ${hours(previousWeekMinutes)} la semaine d'avant.`,
    };
  }
  if (weekMinutes >= previousWeekMinutes * 1.25 && weekMinutes > 0) {
    return {
      id: "focus-up",
      tone: "positive",
      title: "Ton temps de focus grimpe",
      detail: `${hours(weekMinutes)} de travail profond sur 7 jours.`,
    };
  }
  return null;
}

export function scoreInsight(today: number, yesterday: number | null, weakest: keyof ScoreComponents): Insight {
  const label = COMPONENT_WITH_ARTICLE[weakest];
  if (yesterday !== null && today >= yesterday + 5) {
    return {
      id: "score-up",
      tone: "positive",
      title: `LockIn Score +${today - yesterday}`,
      detail: `Belle remontée. Ton point faible reste ${label} : c'est là que se jouent les prochains points.`,
    };
  }
  if (yesterday !== null && today <= yesterday - 5) {
    return {
      id: "score-down",
      tone: "warning",
      title: `LockIn Score ${today - yesterday}`,
      detail: `La journée n'est pas finie. Commence par ${label}, c'est ta composante la plus basse.`,
    };
  }
  return {
    id: "score-lever",
    tone: "info",
    title: `Ton levier : ${label}`,
    detail: "C'est ta composante la plus faible aujourd'hui. Un effort ici fait monter le score le plus vite.",
  };
}

export function rankInsights(insights: Insight[], limit = 6): Insight[] {
  return [...insights].sort((a, b) => ORDER[a.tone] - ORDER[b.tone]).slice(0, limit);
}
