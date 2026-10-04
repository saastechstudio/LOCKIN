"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { goals, posts, routineCheckins, routineItems } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const PATH = "/dashboard/objectifs";

export async function getGoals() {
  const user = await getOrCreateDbUser();
  return db.query.goals.findMany({
    where: eq(goals.userId, user.id),
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  });
}

const createGoalSchema = z.object({
  category: z.enum(["personal", "professional"]),
  title: z.string().trim().min(1).max(140),
  horizonDays: z.number().int().positive().optional(),
  isPublic: z.boolean().default(false),
});

export async function createGoal(input: z.infer<typeof createGoalSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = createGoalSchema.parse(input);

  await db.insert(goals).values({
    userId: user.id,
    category: parsed.category,
    title: parsed.title,
    horizonDays: parsed.horizonDays,
    isPublic: parsed.isPublic,
  });

  revalidatePath(PATH);
}

export async function updateGoalProgress(goalId: number, progress: number) {
  const user = await getOrCreateDbUser();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  await db
    .update(goals)
    .set({ progress: clamped })
    .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));

  revalidatePath(PATH);
}

export async function deleteGoal(goalId: number) {
  const user = await getOrCreateDbUser();
  await db.delete(goals).where(and(eq(goals.id, goalId), eq(goals.userId, user.id)));
  revalidatePath(PATH);
}

/** Partage un objectif dans le feed global — un post simple, tag Discipline. */
export async function shareGoalToFeed(goalId: number) {
  const user = await getOrCreateDbUser();
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, user.id)),
  });
  if (!goal) throw new Error("Objectif introuvable");

  await db.insert(posts).values({
    userId: user.id,
    content: `🎯 Nouvel objectif ${goal.category === "personal" ? "personnel" : "professionnel"} : ${goal.title}`,
    tag: "Discipline",
  });

  revalidatePath(PATH);
  revalidatePath("/dashboard/feed");
}

// ---------------------------------------------------------------------------
// Routines (matin / soir)
// ---------------------------------------------------------------------------

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function getRoutineItems() {
  const user = await getOrCreateDbUser();
  const items = await db.query.routineItems.findMany({
    where: eq(routineItems.userId, user.id),
    orderBy: (fields, { asc }) => [asc(fields.position)],
  });

  const today = todayDateOnly();
  const checkins = await db.query.routineCheckins.findMany({
    where: eq(routineCheckins.date, today),
  });
  const checkedItemIds = new Set(
    checkins
      .filter((c) => items.some((i) => i.id === c.routineItemId))
      .map((c) => c.routineItemId),
  );

  return items.map((item) => ({ ...item, checkedToday: checkedItemIds.has(item.id) }));
}

const createRoutineItemSchema = z.object({
  period: z.enum(["morning", "evening"]),
  label: z.string().trim().min(1).max(140),
});

export async function createRoutineItem(input: z.infer<typeof createRoutineItemSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = createRoutineItemSchema.parse(input);

  const existing = await db.query.routineItems.findMany({
    where: and(eq(routineItems.userId, user.id), eq(routineItems.period, parsed.period)),
  });

  await db.insert(routineItems).values({
    userId: user.id,
    period: parsed.period,
    label: parsed.label,
    position: existing.length,
  });

  revalidatePath(PATH);
}

export async function deleteRoutineItem(itemId: number) {
  const user = await getOrCreateDbUser();
  await db
    .delete(routineItems)
    .where(and(eq(routineItems.id, itemId), eq(routineItems.userId, user.id)));
  revalidatePath(PATH);
}

/** Coche/décoche l'item pour aujourd'hui. */
export async function toggleRoutineCheckin(itemId: number) {
  const user = await getOrCreateDbUser();
  const item = await db.query.routineItems.findFirst({
    where: and(eq(routineItems.id, itemId), eq(routineItems.userId, user.id)),
  });
  if (!item) throw new Error("Routine introuvable");

  const today = todayDateOnly();
  const existing = await db.query.routineCheckins.findFirst({
    where: and(eq(routineCheckins.routineItemId, itemId), eq(routineCheckins.date, today)),
  });

  if (existing) {
    await db.delete(routineCheckins).where(eq(routineCheckins.id, existing.id));
  } else {
    await db.insert(routineCheckins).values({ routineItemId: itemId, date: today });
  }

  revalidatePath(PATH);
}
