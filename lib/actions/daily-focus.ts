"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { dailyFocus, onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

const DEFAULT_TASK = "Exécute ta priorité #1 du jour, sans distraction.";

/**
 * Returns today's daily-focus row for the signed-in member, creating it
 * (seeded from the latest onboarding audit's first-week actions, rotated
 * by day count) the first time it's requested today.
 */
export async function getTodayFocus() {
  const user = await getOrCreateDbUser();
  const today = startOfToday();

  const existing = await db.query.dailyFocus.findFirst({
    where: and(eq(dailyFocus.userId, user.id), eq(dailyFocus.date, today)),
  });
  if (existing) return existing;

  const [latestAudit, priorFocusCount] = await Promise.all([
    db.query.onboardingAudits.findFirst({
      where: eq(onboardingAudits.userId, user.id),
      orderBy: [desc(onboardingAudits.createdAt)],
    }),
    db.$count(dailyFocus, eq(dailyFocus.userId, user.id)),
  ]);

  const actions = latestAudit?.firstWeekActions;
  const taskDescription =
    actions && actions.length > 0
      ? actions[priorFocusCount % actions.length]
      : DEFAULT_TASK;

  const [created] = await db
    .insert(dailyFocus)
    .values({ userId: user.id, date: today, taskDescription })
    .onConflictDoNothing({ target: [dailyFocus.userId, dailyFocus.date] })
    .returning();
  if (created) return created;

  // Race with another request creating today's row concurrently.
  const fallback = await db.query.dailyFocus.findFirst({
    where: and(eq(dailyFocus.userId, user.id), eq(dailyFocus.date, today)),
  });
  if (!fallback) throw new Error("Failed to resolve today's focus row");
  return fallback;
}

const updateSchema = z.object({
  focusId: z.coerce.number().int(),
  taskCompleted: z.coerce.boolean(),
  disciplineRating: z.coerce.number().int().min(1).max(10),
});

export async function updateTodayFocus(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = updateSchema.parse({
    focusId: formData.get("focusId"),
    taskCompleted: formData.get("taskCompleted") === "on",
    disciplineRating: formData.get("disciplineRating"),
  });

  await db
    .update(dailyFocus)
    .set({
      taskCompleted: parsed.taskCompleted,
      disciplineRating: parsed.disciplineRating,
    })
    .where(and(eq(dailyFocus.id, parsed.focusId), eq(dailyFocus.userId, user.id)));

  revalidatePath("/dashboard");
}
