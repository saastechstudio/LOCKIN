"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

const profileSchema = z.object({
  sector: z.string().max(80).optional(),
  skills: z.string().max(300).optional(),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await getOrCreateDbUser();

  const parsed = profileSchema.parse({
    sector: formData.get("sector") || undefined,
    skills: formData.get("skills") || undefined,
    bio: formData.get("bio") || undefined,
  });

  await db
    .update(users)
    .set({
      sector: parsed.sector,
      skills: parsed.skills,
      bio: parsed.bio,
    })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/network");
}
