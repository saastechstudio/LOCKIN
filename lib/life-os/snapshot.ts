import "server-only";

import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";
import { addDays, subDays } from "date-fns";

import { db } from "@/lib/db";
import {
  aiMemories,
  copilotBriefings,
  dailyCheckins,
  dailyFocus,
  focusSessions,
  goals,
  habitLogs,
  habits,
  lifeSphereLinks,
  lifeSpheres,
  planningTasks,
  routineCheckins,
  routineItems,
  type BriefingContent,
  type User,
} from "@/lib/db/schema";
import { startOfDay } from "@/lib/challenges-data";
import { DEFAULT_SPHERES, balanceOf, sphereSignals, sphereStats, type SphereStats } from "./spheres";
import { computeDailyScores, focusScore, scoreTier, weakestComponent, type DayActivity, type DayScore } from "./score";
import { currentStreak, lastDays, successRate, type DatedValue } from "./habits";
import { daysLeft, deadlineOf, expectedProgress, paceOf, progressFromWork, type Pace } from "./goals";
import {
  focusInsight,
  goalInsights,
  habitInsights,
  rankInsights,
  scoreInsight,
  type Insight,
} from "./insights";

/**
 * Tout ce que le cockpit Life OS affiche, chargé en une passe : requêtes
 * parallèles, puis calculs purs (score, sphères, insights). Les écrans
 * reçoivent cet instantané et n'interrogent pas la base eux-mêmes.
 */

const HISTORY_DAYS = 14;
const EFFORT_DAYS = 30;

const key = (d: Date) => startOfDay(d).getTime();

export type SphereView = {
  id: number;
  name: string;
  color: string;
  position: number;
  orbitAngle: number;
  stats: SphereStats;
  goalCount: number;
  habitCount: number;
};

export type GoalView = {
  id: number;
  title: string;
  vision: string | null;
  category: "personal" | "professional";
  sphereId: number | null;
  progress: number;
  pace: Pace;
  expected: number | null;
  daysLeft: number | null;
  minutesInvested: number;
  milestones: { id: number; title: string; done: boolean; position: number }[];
  tasks: {
    id: number;
    title: string;
    done: boolean;
    milestoneId: number | null;
    dueDate: Date | null;
    position: number;
  }[];
  nextTask: string | null;
  difficulties: Insight[];
  createdAt: Date;
  horizonDays: number | null;
};

export type HabitView = {
  id: number;
  label: string;
  category: string;
  unit: string;
  target: number;
  sphereId: number | null;
  todayValue: number;
  doneToday: boolean;
  streak: number;
  success14: number;
  last14: (number | null)[];
};

export type CalendarItem = {
  date: Date;
  kind: "task" | "goal_task" | "deadline";
  title: string;
  done: boolean;
};

export type LifeOsSnapshot = {
  today: Date;
  firstName: string;
  score: DayScore;
  yesterdayScore: number | null;
  week: DayScore[];
  tier: ReturnType<typeof scoreTier>;
  weakest: keyof DayScore["components"];
  focus: { todayMinutes: number; weekMinutes: number; previousWeekMinutes: number; score: number };
  spheres: SphereView[];
  links: { id: number; from: number; to: number }[];
  balance: number | null;
  sphereSignals: ReturnType<typeof sphereSignals>;
  goals: GoalView[];
  habits: HabitView[];
  insights: Insight[];
  calendar: CalendarItem[];
  memories: { id: number; kind: string; content: string; source: string }[];
  briefings: { morning: BriefingContent | null; evening: BriefingContent | null; authors: Record<string, string> };
  todayFocus: { id: number; task: string; done: boolean; rating: number | null } | null;
};

/** Crée l'univers de départ la première fois : la SphereLife n'est jamais vide. */
export async function ensureSpheres(userId: number) {
  const existing = await db.query.lifeSpheres.findMany({
    where: eq(lifeSpheres.userId, userId),
    orderBy: [asc(lifeSpheres.position)],
  });
  if (existing.length > 0) return existing;
  const count = DEFAULT_SPHERES.length;
  await db.insert(lifeSpheres).values(
    DEFAULT_SPHERES.map((s, i) => ({
      userId,
      name: s.name,
      color: s.color,
      position: i,
      orbitAngle: ((i / count) * Math.PI * 2).toFixed(4),
    })),
  );
  return db.query.lifeSpheres.findMany({
    where: eq(lifeSpheres.userId, userId),
    orderBy: [asc(lifeSpheres.position)],
  });
}

export async function loadLifeOs(user: User): Promise<LifeOsSnapshot> {
  const today = startOfDay();
  const historyFrom = subDays(today, HISTORY_DAYS - 1);
  const effortFrom = subDays(today, EFFORT_DAYS - 1);

  const spheres = await ensureSpheres(user.id);

  const [
    myGoals,
    myHabits,
    sessions,
    focusRows,
    checkins,
    routines,
    openPlanning,
    links,
    memories,
    briefings,
  ] = await Promise.all([
    db.query.goals.findMany({
      where: eq(goals.userId, user.id),
      orderBy: [desc(goals.createdAt)],
      with: { milestones: true, tasks: true },
    }),
    db.query.habits.findMany({
      where: and(eq(habits.userId, user.id), isNull(habits.archivedAt)),
      orderBy: [asc(habits.position), asc(habits.createdAt)],
      with: { logs: { where: gte(habitLogs.date, effortFrom) } },
    }),
    db.query.focusSessions.findMany({
      where: and(eq(focusSessions.userId, user.id), gte(focusSessions.date, effortFrom)),
    }),
    db.query.dailyFocus.findMany({
      where: and(eq(dailyFocus.userId, user.id), gte(dailyFocus.date, historyFrom)),
    }),
    db.query.dailyCheckins.findMany({
      columns: { date: true },
      where: and(eq(dailyCheckins.userId, user.id), gte(dailyCheckins.date, historyFrom)),
    }),
    db.query.routineItems.findMany({
      columns: { id: true },
      where: eq(routineItems.userId, user.id),
      with: { checkins: { columns: { date: true }, where: gte(routineCheckins.date, historyFrom) } },
    }),
    db.query.planningTasks.findMany({
      where: and(eq(planningTasks.userId, user.id), eq(planningTasks.completed, false)),
      orderBy: [asc(planningTasks.dueDate)],
      limit: 40,
    }),
    db.query.lifeSphereLinks.findMany({ where: eq(lifeSphereLinks.userId, user.id) }),
    db.query.aiMemories.findMany({
      where: eq(aiMemories.userId, user.id),
      orderBy: [desc(aiMemories.updatedAt)],
      limit: 40,
    }),
    db.query.copilotBriefings.findMany({
      where: and(eq(copilotBriefings.userId, user.id), eq(copilotBriefings.date, today)),
    }),
  ]);

  // ---- Habitudes ----
  const habitLogsById = new Map<number, DatedValue[]>(
    myHabits.map((h) => [h.id, h.logs.map((l) => ({ date: l.date, value: Number(l.value) }))]),
  );
  const habitViews: HabitView[] = myHabits.map((h) => {
    const logs = habitLogsById.get(h.id) ?? [];
    const target = Number(h.target);
    const todayValue = logs.find((l) => key(l.date) === today.getTime())?.value ?? 0;
    return {
      id: h.id,
      label: h.label,
      category: h.category,
      unit: h.unit,
      target,
      sphereId: h.sphereId,
      todayValue,
      doneToday: todayValue >= target,
      streak: currentStreak(logs, target, today),
      success14: successRate(logs, target, today, 14),
      last14: lastDays(logs, today, 14),
    };
  });

  // ---- Activité jour par jour (14 jours) ----
  const days: DayActivity[] = Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const date = addDays(historyFrom, i);
    const k = date.getTime();
    const focusRow = focusRows.find((f) => key(f.date) === k);
    const habitsDone = myHabits.filter((h) => {
      const v = (habitLogsById.get(h.id) ?? []).find((l) => key(l.date) === k)?.value ?? 0;
      return v >= Number(h.target);
    }).length;
    const tasksDone = myGoals.flatMap((g) => g.tasks).filter((t) => t.completedAt && key(t.completedAt) === k).length;
    const milestonesDone = myGoals
      .flatMap((g) => g.milestones)
      .filter((m) => m.completedAt && key(m.completedAt) === k).length;
    const habitLogged = myHabits.some((h) => (habitLogsById.get(h.id) ?? []).some((l) => key(l.date) === k));
    return {
      date,
      disciplineRating: focusRow?.disciplineRating ?? null,
      habitsDone,
      habitsTotal: myHabits.filter((h) => key(h.createdAt) <= k).length,
      focusMinutes: sessions.filter((s) => key(s.date) === k).reduce((sum, s) => sum + s.minutes, 0),
      goalTasksCompleted: tasksDone,
      milestonesCompleted: milestonesDone,
      priorityDone: focusRow?.taskCompleted ?? false,
      otherActivity:
        habitLogged ||
        checkins.some((c) => key(c.date) === k) ||
        routines.some((r) => r.checkins.some((c) => key(c.date) === k)),
    };
  });

  // ---- Sphères ----
  const goalProgress = (g: (typeof myGoals)[number]) =>
    progressFromWork(
      {
        tasksTotal: g.tasks.length,
        tasksDone: g.tasks.filter((t) => t.completedAt).length,
        milestonesTotal: g.milestones.length,
        milestonesDone: g.milestones.filter((m) => m.completedAt).length,
      },
      g.progress,
    );

  const goalSphere = new Map(myGoals.map((g) => [g.id, g.sphereId]));
  const lastActivityBySphere = new Map<number, number>();
  const effortBySphere = new Map<number, number>();
  const bump = (sphereId: number | null | undefined, at: Date, minutes: number) => {
    if (!sphereId) return;
    lastActivityBySphere.set(sphereId, Math.max(lastActivityBySphere.get(sphereId) ?? 0, at.getTime()));
    if (at.getTime() >= effortFrom.getTime()) {
      effortBySphere.set(sphereId, (effortBySphere.get(sphereId) ?? 0) + minutes);
    }
  };
  for (const g of myGoals) {
    for (const t of g.tasks) if (t.completedAt) bump(g.sphereId, t.completedAt, 20);
    for (const m of g.milestones) if (m.completedAt) bump(g.sphereId, m.completedAt, 40);
  }
  for (const s of sessions) bump(s.goalId ? goalSphere.get(s.goalId) : null, s.date, s.minutes);
  for (const h of myHabits) {
    for (const l of h.logs) if (Number(l.value) >= Number(h.target)) bump(h.sphereId, l.date, 20);
  }

  const stats = sphereStats(
    spheres.map((s) => ({
      id: s.id,
      name: s.name,
      goalProgress: myGoals.filter((g) => g.sphereId === s.id).map(goalProgress),
      habitSuccess: habitViews.filter((h) => h.sphereId === s.id).map((h) => h.success14),
      lastActivityAt: lastActivityBySphere.has(s.id) ? new Date(lastActivityBySphere.get(s.id)!) : null,
      effortMinutes: effortBySphere.get(s.id) ?? 0,
    })),
    today,
  );
  const balance = balanceOf(stats);

  // ---- Score ----
  const scores = computeDailyScores(days, HISTORY_DAYS - 7, balance);
  const score = scores[scores.length - 1];
  const yesterdayScore = scores.length > 1 ? scores[scores.length - 2].score : null;

  // ---- Focus ----
  const sumMinutes = (from: Date, to: Date) =>
    sessions
      .filter((s) => key(s.date) >= from.getTime() && key(s.date) <= to.getTime())
      .reduce((sum, s) => sum + s.minutes, 0);
  const todayMinutes = sumMinutes(today, today);
  const weekMinutes = sumMinutes(subDays(today, 6), today);
  const previousWeekMinutes = sumMinutes(subDays(today, 13), subDays(today, 7));

  // ---- Objectifs ----
  const goalLastActivity = (g: (typeof myGoals)[number]) => {
    const times = [
      ...g.tasks.flatMap((t) => (t.completedAt ? [t.completedAt.getTime()] : [])),
      ...g.milestones.flatMap((m) => (m.completedAt ? [m.completedAt.getTime()] : [])),
      ...sessions.filter((s) => s.goalId === g.id).map((s) => s.date.getTime()),
    ];
    return times.length === 0 ? null : new Date(Math.max(...times));
  };
  const goalInsightList = goalInsights(
    myGoals.map((g) => ({
      id: g.id,
      title: g.title,
      progress: goalProgress(g),
      createdAt: g.createdAt,
      horizonDays: g.horizonDays,
      lastActivityAt: goalLastActivity(g),
      openTasks: g.tasks.filter((t) => !t.completedAt).length,
    })),
    today,
  );

  const goalViews: GoalView[] = myGoals.map((g) => {
    const progress = goalProgress(g);
    const expected = expectedProgress(g.createdAt, g.horizonDays, today);
    const tasks = [...g.tasks]
      .sort((a, b) => a.position - b.position || a.id - b.id)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: Boolean(t.completedAt),
        milestoneId: t.milestoneId,
        dueDate: t.dueDate,
        position: t.position,
      }));
    return {
      id: g.id,
      title: g.title,
      vision: g.vision,
      category: g.category,
      sphereId: g.sphereId,
      progress,
      pace: paceOf(progress, expected),
      expected,
      daysLeft: daysLeft(deadlineOf(g.createdAt, g.horizonDays), today),
      minutesInvested: sessions.filter((s) => s.goalId === g.id).reduce((sum, s) => sum + s.minutes, 0),
      milestones: [...g.milestones]
        .sort((a, b) => a.position - b.position || a.id - b.id)
        .map((m) => ({ id: m.id, title: m.title, done: Boolean(m.completedAt), position: m.position })),
      tasks,
      nextTask: tasks.find((t) => !t.done)?.title ?? null,
      difficulties: goalInsightList.filter((i) => i.goalId === g.id),
      createdAt: g.createdAt,
      horizonDays: g.horizonDays,
    };
  });

  // ---- Insights ----
  const habitInsightList = habitInsights(
    habitViews.map((h) => ({
      id: h.id,
      label: h.label,
      target: h.target,
      unit: h.unit,
      logs: habitLogsById.get(h.id) ?? [],
    })),
    today,
  );
  const focusTrend = focusInsight(weekMinutes, previousWeekMinutes);
  const weakest = weakestComponent(score.components);
  const insights = rankInsights(
    [
      scoreInsight(score.score, yesterdayScore, weakest),
      ...goalInsightList,
      ...habitInsightList,
      ...(focusTrend ? [focusTrend] : []),
    ],
    8,
  );

  // ---- Calendrier : 7 prochains jours ----
  const horizon = addDays(today, 6).getTime();
  const calendar: CalendarItem[] = [
    ...openPlanning
      .filter((t) => t.dueDate)
      .map((t) => ({ date: startOfDay(t.dueDate!), kind: "task" as const, title: t.title, done: false })),
    ...myGoals.flatMap((g) =>
      g.tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          date: startOfDay(t.dueDate!),
          kind: "goal_task" as const,
          title: t.title,
          done: Boolean(t.completedAt),
        })),
    ),
    ...myGoals.flatMap((g) => {
      const deadline = deadlineOf(g.createdAt, g.horizonDays);
      return deadline ? [{ date: startOfDay(deadline), kind: "deadline" as const, title: g.title, done: goalProgress(g) >= 100 }] : [];
    }),
  ]
    .map((item) => (item.date.getTime() < today.getTime() && !item.done ? { ...item, date: today } : item))
    .filter((item) => item.date.getTime() >= today.getTime() && item.date.getTime() <= horizon);

  const goalCount = (id: number) => myGoals.filter((g) => g.sphereId === id).length;
  const habitCount = (id: number) => myHabits.filter((h) => h.sphereId === id).length;
  const statsById = new Map(stats.map((s) => [s.id, s]));
  const todayRow = focusRows.find((f) => key(f.date) === today.getTime());

  return {
    today,
    firstName: user.name?.split(" ")[0] ?? "Membre",
    score,
    yesterdayScore,
    week: scores,
    tier: scoreTier(score.score),
    weakest,
    focus: { todayMinutes, weekMinutes, previousWeekMinutes, score: focusScore(todayMinutes) },
    spheres: spheres.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      position: s.position,
      orbitAngle: Number(s.orbitAngle),
      stats: statsById.get(s.id)!,
      goalCount: goalCount(s.id),
      habitCount: habitCount(s.id),
    })),
    links: links.map((l) => ({ id: l.id, from: l.fromSphereId, to: l.toSphereId })),
    balance,
    sphereSignals: sphereSignals(spheres, stats),
    goals: goalViews,
    habits: habitViews,
    insights,
    calendar,
    memories: memories.map((m) => ({ id: m.id, kind: m.kind, content: m.content, source: m.source })),
    briefings: {
      morning: briefings.find((b) => b.period === "morning")?.content ?? null,
      evening: briefings.find((b) => b.period === "evening")?.content ?? null,
      authors: Object.fromEntries(briefings.map((b) => [b.period, b.author])),
    },
    todayFocus: todayRow
      ? { id: todayRow.id, task: todayRow.taskDescription, done: todayRow.taskCompleted, rating: todayRow.disciplineRating }
      : null,
  };
}

