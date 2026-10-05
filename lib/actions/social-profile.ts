"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users, goals, routineItems, type ProfileLink } from "@/lib/db/schema";
import { getOrCreateDbUser, getDbUserOrNull } from "@/lib/auth";
import { moderateOrThrow } from "@/lib/moderation/enforce";
import { isHttpsUrl } from "@/lib/safe-url";

/**
 * Profil public Lockin Social Club. `viewerIsOwner` dit si l'appelant peut
 * voir ses objectifs privés (isPublic=false) et éditer la fiche — sinon on
 * ne renvoie que les objectifs publics.
 */
export async function getSocialProfile(userId: number) {
  const viewer = await getDbUserOrNull();
  const viewerIsOwner = viewer?.id === userId;

  const profile = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      sector: true,
      country: true,
      city: true,
      mainSport: true,
      lockinLevel: true,
      links: true,
    },
  });
  if (!profile) return null;

  const allGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
  });
  const visibleGoals = viewerIsOwner ? allGoals : allGoals.filter((g) => g.isPublic);

  const routine = await db.query.routineItems.findMany({
    where: eq(routineItems.userId, userId),
    orderBy: (fields, { asc }) => [asc(fields.position)],
  });

  return { profile, goals: visibleGoals, routine, viewerIsOwner };
}

const linkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  // https uniquement : un lien « javascript: » ou « data: » sur un profil public serait une faille XSS.
  url: z.string().trim().max(300).refine(isHttpsUrl, "Le lien doit commencer par https://"),
});

const updateSchema = z.object({
  bio: z.string().max(500).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  sector: z.string().max(80).optional(),
  mainSport: z.string().max(40).optional(),
  links: z.array(linkSchema).max(6),
});

export type UpdateSocialProfileInput = z.infer<typeof updateSchema>;

export async function updateSocialProfile(input: UpdateSocialProfileInput) {
  const user = await getOrCreateDbUser();
  const parsed = updateSchema.parse(input);
  // Le profil est public : bio et libellés de liens passent par le même filtre que le feed.
  await moderateOrThrow(
    user,
    [parsed.bio, parsed.city, parsed.sector, ...parsed.links.map((l) => l.label)].filter(Boolean).join("\n"),
  );

  await db
    .update(users)
    .set({
      bio: parsed.bio || null,
      country: parsed.country || null,
      city: parsed.city || null,
      sector: parsed.sector || null,
      mainSport: parsed.mainSport || null,
      links: parsed.links as ProfileLink[],
    })
    .where(eq(users.id, user.id));

  revalidatePath("/dashboard/profil");
  revalidatePath(`/dashboard/u/${user.id}`);
}
