"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { dailyCheckins } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const checkinSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  wins: z.string().max(2000).optional(),
  bottlenecks: z.string().max(2000).optional(),
  focusOfTomorrow: z.string().max(2000).optional(),
});

export async function createCheckin(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = checkinSchema.parse({
    rating: formData.get("rating"),
    wins: formData.get("wins") || undefined,
    bottlenecks: formData.get("bottlenecks") || undefined,
    focusOfTomorrow: formData.get("focusOfTomorrow") || undefined,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.insert(dailyCheckins).values({
    userId: user.id,
    date: today,
    rating: parsed.rating,
    wins: parsed.wins,
    bottlenecks: parsed.bottlenecks,
    focusOfTomorrow: parsed.focusOfTomorrow,
  });

  revalidatePath("/dashboard");
}
