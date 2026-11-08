"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { action, UserFacingError } from "@/lib/action-result";
import { getOrCreateDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  focusSessions,
  goalMilestones,
  goalTasks,
  goals,
  habitLogs,
  habits,
  lifeSphereLinks,
  lifeSpheres,
} from "@/lib/db/schema";
import { generateStructured } from "@/lib/ai/structured";
import { startOfDay } from "@/lib/challenges-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { progressFromWork } from "@/lib/life-os/goals";
import { HABIT_PRESETS } from "@/lib/life-os/habits";
import { COPILOT_SYSTEM } from "@/lib/copilot/briefing";

/**
 * Écritures du Life OS : habitudes, objectifs vivants (jalons, tâches),
 * sessions de focus, sphères de vie et leurs liens. Chaque action vérifie
 * que l'élément appartient au membre connecté.
 */

const id = z.number().int().positive();

function refresh(...extra: string[]) {
  for (const path of ["/dashboard", "/dashboard/objectifs", "/dashboard/habitudes", ...extra]) {
    revalidatePath(path);
  }
  revalidatePath("/dashboard/sphere/[id]", "page");
}

async function writer() {
  const user = await getOrCreateDbUser();
  enforceRateLimit("lifeOs", user.id);
  return user;
}

async function ownedGoal(userId: number, goalId: number) {
  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
    with: { milestones: true, tasks: true },
  });
  if (!goal) throw new UserFacingError("Objectif introuvable.");
  return goal;
}

async function ownedSphereId(userId: number, sphereId: number | null | undefined) {
  if (!sphereId) return null;
  const sphere = await db.query.lifeSpheres.findFirst({
    columns: { id: true },
    where: and(eq(lifeSpheres.id, sphereId), eq(lifeSpheres.userId, userId)),
  });
  if (!sphere) throw new UserFacingError("Sphère introuvable.");
  return sphere.id;
}

/** La progression enregistrée suit le travail réel (profils, feed, anciens écrans la lisent). */
async function syncGoalProgress(goalId: number) {
  const goal = await db.query.goals.findFirst({
    where: eq(goals.id, goalId),
    with: { milestones: true, tasks: true },
  });
  if (!goal) return;
  const progress = progressFromWork(
    {
      tasksTotal: goal.tasks.length,
      tasksDone: goal.tasks.filter((t) => t.completedAt).length,
      milestonesTotal: goal.milestones.length,
      milestonesDone: goal.milestones.filter((m) => m.completedAt).length,
    },
    goal.progress,
  );
  if (progress !== goal.progress) await db.update(goals).set({ progress }).where(eq(goals.id, goalId));
}

// ---------------------------------------------------------------------------
// Habitudes
// ---------------------------------------------------------------------------

const habitInput = z.object({
  category: z.enum(["sommeil", "sport", "lecture", "meditation", "travail", "nutrition"]),
  label: z.string().trim().min(2, "Donne un nom à l'habitude.").max(80),
  target: z.number().positive("La cible doit être positive.").max(10_000),
  unit: z.string().trim().min(1).max(20),
  sphereId: id.nullable().optional(),
});

export const createHabit = action(async (input: z.infer<typeof habitInput>) => {
  const user = await writer();
  const parsed = habitInput.parse(input);
  const sphereId = await ownedSphereId(user.id, parsed.sphereId);
  await db.insert(habits).values({
    userId: user.id,
    category: parsed.category,
    label: parsed.label,
    target: String(parsed.target),
    unit: parsed.unit,
    sphereId,
  });
  refresh();
});

export const createHabitFromPreset = action(async (presetIndex: number, sphereId?: number | null) => {
  const user = await writer();
  const preset = HABIT_PRESETS[z.number().int().min(0).parse(presetIndex)];
  if (!preset) throw new UserFacingError("Habitude inconnue.");
  await db.insert(habits).values({
    userId: user.id,
    category: preset.category,
    label: preset.label,
    target: String(preset.target),
    unit: preset.unit,
    sphereId: await ownedSphereId(user.id, sphereId),
  });
  refresh();
});

/** Note la valeur du jour (remplace la précédente). */
export const logHabit = action(async (habitId: number, value: number) => {
  const user = await writer();
  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, id.parse(habitId)), eq(habits.userId, user.id)),
  });
  if (!habit) throw new UserFacingError("Habitude introuvable.");
  const v = z.number().min(0).max(10_000).parse(value);
  const today = startOfDay();
  if (v === 0) {
    await db.delete(habitLogs).where(and(eq(habitLogs.habitId, habit.id), eq(habitLogs.date, today)));
  } else {
    await db
      .insert(habitLogs)
      .values({ habitId: habit.id, userId: user.id, date: today, value: String(v) })
      .onConflictDoUpdate({ target: [habitLogs.habitId, habitLogs.date], set: { value: String(v) } });
  }
  refresh();
});

export const archiveHabit = action(async (habitId: number) => {
  const user = await writer();
  await db
    .update(habits)
    .set({ archivedAt: new Date() })
    .where(and(eq(habits.id, id.parse(habitId)), eq(habits.userId, user.id)));
  refresh();
});

export const setHabitSphere = action(async (habitId: number, sphereId: number | null) => {
  const user = await writer();
  const owned = await ownedSphereId(user.id, sphereId);
  await db
    .update(habits)
    .set({ sphereId: owned })
    .where(and(eq(habits.id, id.parse(habitId)), eq(habits.userId, user.id)));
  refresh();
});

// ---------------------------------------------------------------------------
// Objectifs vivants
// ---------------------------------------------------------------------------

const goalInput = z.object({
  title: z.string().trim().min(2, "Nomme ton objectif.").max(140),
  vision: z.string().trim().max(600).optional(),
  horizonDays: z.number().int().min(7).max(1095).nullable().optional(),
  category: z.enum(["personal", "professional"]).default("personal"),
  sphereId: id.nullable().optional(),
});

export const createLifeGoal = action(async (input: z.input<typeof goalInput>) => {
  const user = await writer();
  const parsed = goalInput.parse(input);
  const sphereId = await ownedSphereId(user.id, parsed.sphereId);
  const [goal] = await db
    .insert(goals)
    .values({
      userId: user.id,
      title: parsed.title,
      vision: parsed.vision || null,
      horizonDays: parsed.horizonDays ?? null,
      category: parsed.category,
      sphereId,
    })
    .returning({ id: goals.id });
  refresh();
  return { id: goal.id };
});

export const updateLifeGoal = action(
  async (goalId: number, patch: { vision?: string | null; sphereId?: number | null; title?: string }) => {
    const user = await writer();
    const goal = await ownedGoal(user.id, id.parse(goalId));
    const parsed = z
      .object({
        vision: z.string().trim().max(600).nullable().optional(),
        title: z.string().trim().min(2).max(140).optional(),
        sphereId: id.nullable().optional(),
      })
      .parse(patch);
    await db
      .update(goals)
      .set({
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        ...(parsed.vision !== undefined ? { vision: parsed.vision || null } : {}),
        ...(parsed.sphereId !== undefined ? { sphereId: await ownedSphereId(user.id, parsed.sphereId) } : {}),
      })
      .where(eq(goals.id, goal.id));
    refresh();
  },
);

export const addMilestone = action(async (goalId: number, title: string) => {
  const user = await writer();
  const goal = await ownedGoal(user.id, id.parse(goalId));
  const t = z.string().trim().min(2, "Nomme le jalon.").max(140).parse(title);
  await db.insert(goalMilestones).values({ goalId: goal.id, title: t, position: goal.milestones.length });
  await syncGoalProgress(goal.id);
  refresh();
});

export const toggleMilestone = action(async (milestoneId: number) => {
  const user = await writer();
  const milestone = await db.query.goalMilestones.findFirst({
    where: eq(goalMilestones.id, id.parse(milestoneId)),
    with: { goal: { columns: { userId: true } } },
  });
  if (!milestone || milestone.goal.userId !== user.id) throw new UserFacingError("Jalon introuvable.");
  await db
    .update(goalMilestones)
    .set({ completedAt: milestone.completedAt ? null : new Date() })
    .where(eq(goalMilestones.id, milestone.id));
  await syncGoalProgress(milestone.goalId);
  refresh();
});

export const addGoalTask = action(
  async (goalId: number, input: { title: string; milestoneId?: number | null; dueDate?: string | null }) => {
    const user = await writer();
    const goal = await ownedGoal(user.id, id.parse(goalId));
    const parsed = z
      .object({
        title: z.string().trim().min(2, "Décris la tâche.").max(140),
        milestoneId: id.nullable().optional(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      })
      .parse(input);
    if (parsed.milestoneId && !goal.milestones.some((m) => m.id === parsed.milestoneId)) {
      throw new UserFacingError("Jalon introuvable.");
    }
    await db.insert(goalTasks).values({
      goalId: goal.id,
      milestoneId: parsed.milestoneId ?? null,
      title: parsed.title,
      dueDate: parsed.dueDate ? new Date(`${parsed.dueDate}T00:00:00`) : null,
      position: goal.tasks.length,
    });
    await syncGoalProgress(goal.id);
    refresh();
  },
);

export const toggleGoalTask = action(async (taskId: number) => {
  const user = await writer();
  const task = await db.query.goalTasks.findFirst({
    where: eq(goalTasks.id, id.parse(taskId)),
    with: { goal: { columns: { userId: true } } },
  });
  if (!task || task.goal.userId !== user.id) throw new UserFacingError("Tâche introuvable.");
  await db
    .update(goalTasks)
    .set({ completedAt: task.completedAt ? null : new Date() })
    .where(eq(goalTasks.id, task.id));
  await syncGoalProgress(task.goalId);
  refresh();
});

export const deleteGoalTask = action(async (taskId: number) => {
  const user = await writer();
  const task = await db.query.goalTasks.findFirst({
    where: eq(goalTasks.id, id.parse(taskId)),
    with: { goal: { columns: { userId: true } } },
  });
  if (!task || task.goal.userId !== user.id) throw new UserFacingError("Tâche introuvable.");
  await db.delete(goalTasks).where(eq(goalTasks.id, task.id));
  await syncGoalProgress(task.goalId);
  refresh();
});

const planSchema = z.object({
  vision: z
    .string()
    .max(400)
    .describe("La vision finale : à quoi ressemble « c'est fait », concrètement, en 1 à 2 phrases."),
  milestones: z
    .array(
      z.object({
        title: z.string().max(100).describe("Jalon vérifiable, formulé comme un résultat."),
        tasks: z.array(z.string().max(120)).min(2).max(4).describe("Tâches concrètes, faisables en une séance."),
      }),
    )
    .min(3)
    .max(5)
    .describe("Jalons dans l'ordre chronologique, de la première étape à l'objectif atteint."),
});

/** Le copilote découpe l'objectif : vision, jalons, tâches. Ajouté à la suite de l'existant. */
export const planGoalWithCopilot = action(async (goalId: number) => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("aiPlan", user.id);
  const goal = await ownedGoal(user.id, id.parse(goalId));
  const sphere = goal.sphereId
    ? await db.query.lifeSpheres.findFirst({ columns: { name: true }, where: eq(lifeSpheres.id, goal.sphereId) })
    : null;

  const existing = [
    ...goal.milestones.map((m) => `Jalon déjà prévu : ${m.title}`),
    ...goal.tasks.map((t) => `Tâche déjà prévue : ${t.title}`),
  ].join("\n");
  const result = await generateStructured({
    schema: planSchema,
    system: COPILOT_SYSTEM,
    prompt: `Découpe cet objectif en système vivant.\nObjectif : ${goal.title}\n${goal.vision ? `Vision du membre : ${goal.vision}\n` : ""}${goal.horizonDays ? `Échéance : ${goal.horizonDays} jours\n` : ""}${sphere ? `Domaine de vie : ${sphere.name}\n` : ""}${existing ? `${existing}\nNe répète pas ce qui existe déjà : continue à partir de là.\n` : ""}Donne la vision finale, puis 3 à 5 jalons ordonnés, chacun avec 2 à 4 tâches concrètes.`,
    label: "copilot/plan",
  });
  if (!result) throw new UserFacingError("Le copilote est indisponible pour le moment. Réessaie dans quelques minutes.");

  const plan = result.object;
  if (!goal.vision && plan.vision) {
    await db.update(goals).set({ vision: plan.vision }).where(eq(goals.id, goal.id));
  }
  let milestonePosition = goal.milestones.length;
  let taskPosition = goal.tasks.length;
  for (const m of plan.milestones) {
    const [milestone] = await db
      .insert(goalMilestones)
      .values({ goalId: goal.id, title: m.title, position: milestonePosition++ })
      .returning({ id: goalMilestones.id });
    await db.insert(goalTasks).values(
      m.tasks.map((t) => ({ goalId: goal.id, milestoneId: milestone.id, title: t, position: taskPosition++ })),
    );
  }
  await syncGoalProgress(goal.id);
  refresh();
  return { milestones: plan.milestones.length };
});

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

export const logFocusSession = action(
  async (input: { minutes: number; goalId?: number | null; label?: string | null }) => {
    const user = await writer();
    const parsed = z
      .object({
        minutes: z.number().int().min(1).max(600),
        goalId: id.nullable().optional(),
        label: z.string().trim().max(80).nullable().optional(),
      })
      .parse(input);
    const goalId = parsed.goalId ? (await ownedGoal(user.id, parsed.goalId)).id : null;
    await db.insert(focusSessions).values({
      userId: user.id,
      goalId,
      date: startOfDay(),
      minutes: parsed.minutes,
      label: parsed.label || null,
    });
    refresh();
  },
);

// ---------------------------------------------------------------------------
// Sphères de vie
// ---------------------------------------------------------------------------

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide.");
const sphereName = z.string().trim().min(2, "Nomme la sphère.").max(40);

export const createSphere = action(async (input: { name: string; color: string }) => {
  const user = await writer();
  const parsed = z.object({ name: sphereName, color }).parse(input);
  const count = await db.$count(lifeSpheres, eq(lifeSpheres.userId, user.id));
  if (count >= 24) throw new UserFacingError("Ton univers compte déjà 24 sphères.");
  const [sphere] = await db
    .insert(lifeSpheres)
    .values({
      userId: user.id,
      name: parsed.name,
      color: parsed.color,
      position: count,
      orbitAngle: (((count * 137.5) % 360) * (Math.PI / 180)).toFixed(4),
    })
    .returning({ id: lifeSpheres.id });
  refresh();
  return { id: sphere.id };
});

export const updateSphere = action(async (sphereId: number, patch: { name?: string; color?: string }) => {
  const user = await writer();
  const parsed = z.object({ name: sphereName.optional(), color: color.optional() }).parse(patch);
  await db
    .update(lifeSpheres)
    .set(parsed)
    .where(and(eq(lifeSpheres.id, id.parse(sphereId)), eq(lifeSpheres.userId, user.id)));
  refresh();
});

export const deleteSphere = action(async (sphereId: number) => {
  const user = await writer();
  await db
    .delete(lifeSpheres)
    .where(and(eq(lifeSpheres.id, id.parse(sphereId)), eq(lifeSpheres.userId, user.id)));
  refresh();
});

/** Ordre de priorité : la première sphère gravite au plus près du noyau. */
export const reorderSpheres = action(async (orderedIds: number[]) => {
  const user = await writer();
  const ids = z.array(id).max(24).parse(orderedIds);
  const owned = await db.query.lifeSpheres.findMany({
    columns: { id: true },
    where: and(eq(lifeSpheres.userId, user.id), inArray(lifeSpheres.id, ids)),
  });
  if (owned.length !== ids.length) throw new UserFacingError("Sphère introuvable.");
  for (const [position, sphereId] of ids.entries()) {
    await db.update(lifeSpheres).set({ position }).where(eq(lifeSpheres.id, sphereId));
  }
  refresh();
});

/** Place choisie sur l'orbite (glisser-déposer dans l'univers). */
export const moveSphere = action(async (sphereId: number, angle: number) => {
  const user = await writer();
  const a = z.number().finite().parse(angle);
  const normalized = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  await db
    .update(lifeSpheres)
    .set({ orbitAngle: normalized.toFixed(4) })
    .where(and(eq(lifeSpheres.id, id.parse(sphereId)), eq(lifeSpheres.userId, user.id)));
});

/** Crée ou retire l'influence « from → to ». */
export const toggleSphereLink = action(async (fromId: number, toId: number) => {
  const user = await writer();
  const from = id.parse(fromId);
  const to = id.parse(toId);
  if (from === to) throw new UserFacingError("Choisis deux sphères différentes.");
  const owned = await db.query.lifeSpheres.findMany({
    columns: { id: true },
    where: and(eq(lifeSpheres.userId, user.id), inArray(lifeSpheres.id, [from, to])),
  });
  if (owned.length !== 2) throw new UserFacingError("Sphère introuvable.");
  const existing = await db.query.lifeSphereLinks.findFirst({
    where: and(eq(lifeSphereLinks.fromSphereId, from), eq(lifeSphereLinks.toSphereId, to)),
  });
  if (existing) {
    await db.delete(lifeSphereLinks).where(eq(lifeSphereLinks.id, existing.id));
  } else {
    await db.insert(lifeSphereLinks).values({ userId: user.id, fromSphereId: from, toSphereId: to });
  }
  refresh();
  return { linked: !existing };
});
