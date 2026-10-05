"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { goals, posts, routineItems, users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { moderateOrThrow } from "@/lib/moderation/enforce";
import {
  GOAL_DOMAINS,
  LOCKIN_TAGS,
  PROFESSIONAL_GOAL_DOMAINS,
  SPORT_ACTIVITIES,
} from "@/lib/social/data";

/** Si le membre a déjà fait le rituel, la page le renvoie direct vers le feed. */
export async function getLockinOnboardingStatus() {
  const user = await getOrCreateDbUser();
  return { completed: Boolean(user.lockinOnboardingCompletedAt) };
}

const completeOnboardingSchema = z.object({
  motivation: z.string().trim().min(10, "Dis-nous-en un peu plus (10 caractères minimum).").max(600),
  goalDomain: z.enum(GOAL_DOMAINS),
  subGoal: z.string().trim().max(140).optional(),
  mainSport: z.enum(SPORT_ACTIVITIES.map((s) => s.id) as [string, ...string[]]),
  morningRoutine: z.string().trim().min(1).max(140),
  eveningRoutine: z.string().trim().min(1).max(140),
});

export type CompleteLockinOnboardingInput = z.infer<typeof completeOnboardingSchema>;

/**
 * Le rituel en un seul geste : motivation → premier post, objectif 30 jours
 * → une ligne `goals`, sport principal → `users.mainSport`, routines matin
 * et soir → deux lignes `routineItems`. Idempotent : si le membre a déjà
 * complété le rituel (retour arrière, double clic), on ne duplique rien.
 */
export async function completeLockinOnboarding(input: CompleteLockinOnboardingInput) {
  const user = await getOrCreateDbUser();
  if (user.lockinOnboardingCompletedAt) {
    return { ok: true as const };
  }

  const parsed = completeOnboardingSchema.parse(input);
  // La motivation devient un post public : même filtrage que le feed.
  await moderateOrThrow(
    user,
    [parsed.motivation, parsed.subGoal, parsed.morningRoutine, parsed.eveningRoutine]
      .filter(Boolean)
      .join("\n"),
    {
      allowNonMember: true,
    },
  );
  const sport = SPORT_ACTIVITIES.find((s) => s.id === parsed.mainSport);
  const isProfessional = PROFESSIONAL_GOAL_DOMAINS.includes(parsed.goalDomain);
  const tag = LOCKIN_TAGS.includes(parsed.goalDomain) ? parsed.goalDomain : "Discipline";

  // On « réserve » le rituel d'abord : un double envoi (double clic, deux
  // onglets) ne crée qu'un seul objectif, une seule routine, un seul post.
  const [claimed] = await db
    .update(users)
    .set({
      mainSport: parsed.mainSport,
      motivationInitiale: parsed.motivation,
      lockinOnboardingCompletedAt: new Date(),
    })
    .where(and(eq(users.id, user.id), isNull(users.lockinOnboardingCompletedAt)))
    .returning({ id: users.id });
  if (!claimed) return { ok: true as const };

  await db.insert(goals).values({
    userId: user.id,
    category: isProfessional ? "professional" : "personal",
    title: parsed.subGoal || `Devenir Lockin — ${parsed.goalDomain}`,
    domain: parsed.goalDomain,
    horizonDays: 30,
  });

  await db.insert(routineItems).values([
    { userId: user.id, period: "morning", label: parsed.morningRoutine, position: 0 },
    { userId: user.id, period: "evening", label: parsed.eveningRoutine, position: 0 },
  ]);

  await db.insert(posts).values({
    userId: user.id,
    content: parsed.motivation,
    tag,
    sport: sport?.id,
  });


  revalidatePath("/dashboard/feed");
  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard/objectifs");

  return { ok: true as const };
}
