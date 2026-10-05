"use server";

import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";

import { db } from "@/lib/db";
import { challengeParticipants, dailyFocus, goals } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { disciplineLevel, disciplineScore } from "@/lib/lockin-level";
import { startOfDay } from "@/lib/challenges-data";

const DAYS = 30;

/**
 * Données de l'écran Progression : discipline jour par jour (30 jours),
 * avancement de chaque objectif, régularité dans les challenges.
 * Tout est restitué en barres verticales, jamais en camembert.
 */
export async function getProgression() {
  const me = await getOrCreateDbUser();
  const today = startOfDay();
  const from = subDays(today, DAYS - 1);

  const [focus, myGoals, participations] = await Promise.all([
    db.query.dailyFocus.findMany({
      columns: { date: true, disciplineRating: true, taskCompleted: true },
      where: and(eq(dailyFocus.userId, me.id), gte(dailyFocus.date, from)),
    }),
    db.query.goals.findMany({
      columns: { id: true, title: true, progress: true, horizonDays: true, category: true },
      where: eq(goals.userId, me.id),
    }),
    db.query.challengeParticipants.findMany({
      where: eq(challengeParticipants.userId, me.id),
      with: {
        challenge: { columns: { slug: true, title: true, durationDays: true } },
        checkins: { columns: { id: true } },
      },
    }),
  ]);

  const days = Array.from({ length: DAYS }, (_, i) => {
    const day = subDays(today, DAYS - 1 - i);
    const row = focus.find((f) => startOfDay(f.date).getTime() === day.getTime());
    return {
      date: day,
      // Note 1–10 → hauteur 0–100 ; null = journée non notée (barre vide).
      value: row?.disciplineRating ? row.disciplineRating * 10 : null,
      taskCompleted: row?.taskCompleted ?? false,
    };
  });

  const last7 = days.slice(-7).map((d) => d.value).filter((v): v is number => v !== null);
  const score7 = disciplineScore(last7.map((v) => v / 10));
  const rated = days.filter((d) => d.value !== null).length;

  return {
    days,
    score7,
    level: disciplineLevel(score7),
    ratedDays: rated,
    completedTasks: days.filter((d) => d.taskCompleted).length,
    goals: myGoals,
    challenges: participations.map((p) => ({
      slug: p.challenge.slug,
      title: p.challenge.title,
      durationDays: p.challenge.durationDays,
      done: p.checkins.length,
    })),
  };
}
