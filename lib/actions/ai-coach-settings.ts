"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const schema = z.object({
  aiCoachName: z
    .string()
    .trim()
    .max(24)
    .optional()
    .transform((v) => (v ? v : null)),
  aiCoachTone: z.enum([
    "bienveillant",
    "exigeant",
    "scientifique",
    "creatif",
    "founder_mode",
  ]),
  aiCoachAppearance: z.enum(["masculin", "feminin", "neutre", "minimaliste"]),
  aiCoachVisualStyle: z.enum([
    "friendly_silicon_valley",
    "premium_minimaliste",
    "dark_mode_founder",
    "gradient_mode",
    "ultra_minimal",
  ]),
});

export async function updateAiCoachSettings(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = schema.parse({
    aiCoachName: formData.get("aiCoachName") ?? undefined,
    aiCoachTone: formData.get("aiCoachTone"),
    aiCoachAppearance: formData.get("aiCoachAppearance"),
    aiCoachVisualStyle: formData.get("aiCoachVisualStyle"),
  });

  await db.update(users).set(parsed).where(eq(users.id, user.id));

  revalidatePath("/dashboard/settings/ai");
  revalidatePath("/dashboard/coach");
}
