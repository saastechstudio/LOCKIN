"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { planningTasks } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

export async function createTask(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = createTaskSchema.parse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    priority: formData.get("priority") || "medium",
  });

  await db.insert(planningTasks).values({
    userId: user.id,
    title: parsed.title,
    notes: parsed.notes,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    priority: parsed.priority,
  });

  revalidatePath("/dashboard/planning");
}

export async function toggleTask(taskId: number, completed: boolean) {
  const user = await getOrCreateDbUser();
  await db
    .update(planningTasks)
    .set({ completed })
    .where(and(eq(planningTasks.id, taskId), eq(planningTasks.userId, user.id)));
  revalidatePath("/dashboard/planning");
}

export async function deleteTask(taskId: number) {
  const user = await getOrCreateDbUser();
  await db
    .delete(planningTasks)
    .where(and(eq(planningTasks.id, taskId), eq(planningTasks.userId, user.id)));
  revalidatePath("/dashboard/planning");
}
