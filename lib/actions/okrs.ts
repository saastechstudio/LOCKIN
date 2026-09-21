"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { okrs } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const createOkrSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(60),
  targetValue: z.coerce.number().positive(),
  unit: z.string().min(1).max(30),
  dueDate: z.string().optional(),
});

export async function createOkr(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = createOkrSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    targetValue: formData.get("targetValue"),
    unit: formData.get("unit"),
    dueDate: formData.get("dueDate") || undefined,
  });

  await db.insert(okrs).values({
    userId: user.id,
    title: parsed.title,
    description: parsed.description,
    category: parsed.category,
    targetValue: parsed.targetValue.toString(),
    unit: parsed.unit,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
  });

  revalidatePath("/dashboard");
}

export async function updateOkrProgress(okrId: number, currentValue: number) {
  const user = await getOrCreateDbUser();

  const okr = await db.query.okrs.findFirst({
    where: and(eq(okrs.id, okrId), eq(okrs.userId, user.id)),
  });
  if (!okr) throw new Error("OKR introuvable");

  const target = Number(okr.targetValue);
  const status = currentValue >= target ? "completed" : "in_progress";

  await db
    .update(okrs)
    .set({ currentValue: currentValue.toString(), status })
    .where(and(eq(okrs.id, okrId), eq(okrs.userId, user.id)));

  revalidatePath("/dashboard");
}

export async function deleteOkr(okrId: number) {
  const user = await getOrCreateDbUser();
  await db
    .delete(okrs)
    .where(and(eq(okrs.id, okrId), eq(okrs.userId, user.id)));
  revalidatePath("/dashboard");
}
