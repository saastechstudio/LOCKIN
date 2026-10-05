"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { LOCKIN_TAGS } from "@/lib/social/data";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";

/** Annuaire des mentors : membres qui se déclarent disponibles pour guider, filtrable par domaine. */
export async function getMentors(domain?: string) {
  const me = await getOrCreateDbUser();
  const rows = await db.query.users.findMany({
    where: eq(users.isMentor, true),
    columns: {
      id: true,
      name: true,
      city: true,
      country: true,
      sector: true,
      lockinLevel: true,
      mentorDomains: true,
      mentorPitch: true,
    },
    orderBy: [desc(users.lockinLevel)],
  });
  return rows
    .filter((m) => !domain || m.mentorDomains.includes(domain))
    .map((m) => ({ ...m, isMe: m.id === me.id }));
}

const mentorSchema = z.object({
  isMentor: z.boolean(),
  domains: z.array(z.enum(LOCKIN_TAGS)).max(4),
  pitch: z.string().trim().max(400),
});

export async function updateMentorProfile(input: z.infer<typeof mentorSchema>) {
  const me = await getOrCreateDbUser();
  assertClubMember(me);
  const parsed = mentorSchema.parse(input);
  if (parsed.isMentor && parsed.domains.length === 0) {
    throw new Error("Choisis au moins un domaine dans lequel tu peux guider.");
  }
  if (parsed.pitch) await moderateOrThrow(me, parsed.pitch);

  await db
    .update(users)
    .set({
      isMentor: parsed.isMentor,
      mentorDomains: parsed.domains,
      mentorPitch: parsed.pitch || null,
    })
    .where(eq(users.id, me.id));

  revalidatePath("/dashboard/mentors");
}
