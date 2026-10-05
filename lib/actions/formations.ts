"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { action, UserFacingError } from "@/lib/action-result";

import { db } from "@/lib/db";
import {
  formationEnrollments,
  formationModules,
  formationProgress,
  formations,
} from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";
import { FORMATION_LEVELS, FORMATION_LIMITS, FORMATION_THEMES } from "@/lib/formations-data";
import {
  assertOwnsFormation,
  getChapterOwnerInfo,
  revalidateFormation,
} from "@/lib/formations-access";

const formationSchema = z.object({
  title: z.string().trim().min(3, "Titre : 3 caractères minimum.").max(FORMATION_LIMITS.title),
  description: z.string().trim().min(10, "Description : 10 caractères minimum.").max(FORMATION_LIMITS.description),
  theme: z.enum(FORMATION_THEMES),
  level: z.enum(FORMATION_LEVELS),
  durationHours: z.number().int().min(1, "Durée : 1 heure minimum.").max(FORMATION_LIMITS.maxHours),
  /** En euros, deux décimales au plus ; vide ou 0 = gratuite. */
  priceEuros: z.number().min(0).max(FORMATION_LIMITS.maxPriceEuros).nullable().optional(),
});

export type FormationInput = z.infer<typeof formationSchema>;

function toCents(priceEuros: number | null | undefined): number | null {
  if (!priceEuros) return null;
  const cents = Math.round(priceEuros * 100);
  return cents > 0 ? cents : null;
}

/** Crée le squelette vide d'une formation (brouillon, sans module). */
export const createFormation = action(async (input: FormationInput) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationCreate", user.id);
  const parsed = formationSchema.parse(input);
  await moderateOrThrow(user, `${parsed.title}\n${parsed.description}`);

  const [created] = await db
    .insert(formations)
    .values({
      creatorId: user.id,
      title: parsed.title,
      description: parsed.description,
      theme: parsed.theme,
      level: parsed.level,
      durationHours: parsed.durationHours,
      priceCents: toCents(parsed.priceEuros),
    })
    .returning({ id: formations.id });

  revalidatePath("/formations");
  return { id: created.id };
});

export const updateFormation = action(async (formationId: number, input: FormationInput) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationEdit", user.id);
  await assertOwnsFormation(formationId, user.id);
  const parsed = formationSchema.parse(input);
  await moderateOrThrow(user, `${parsed.title}\n${parsed.description}`);

  await db
    .update(formations)
    .set({
      title: parsed.title,
      description: parsed.description,
      theme: parsed.theme,
      level: parsed.level,
      durationHours: parsed.durationHours,
      priceCents: toCents(parsed.priceEuros),
      updatedAt: new Date(),
    })
    .where(eq(formations.id, formationId));

  revalidateFormation(formationId);
});

/** Publier exige au moins un chapitre : on ne met pas en ligne une coquille vide. */
export const publishFormation = action(async (formationId: number) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationEdit", user.id);
  await assertOwnsFormation(formationId, user.id);

  const modules = await db.query.formationModules.findMany({
    columns: { id: true },
    where: eq(formationModules.formationId, formationId),
    with: { chapters: { columns: { id: true } } },
  });
  if (!modules.some((m) => m.chapters.length > 0)) {
    throw new UserFacingError("Ajoute au moins un chapitre avant de publier.");
  }

  await db
    .update(formations)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(formations.id, formationId));
  revalidateFormation(formationId);
});

export const unpublishFormation = action(async (formationId: number) => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("formationEdit", user.id);
  await assertOwnsFormation(formationId, user.id);
  await db
    .update(formations)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(formations.id, formationId));
  revalidateFormation(formationId);
});

export const deleteFormation = action(async (formationId: number) => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("formationEdit", user.id);
  await assertOwnsFormation(formationId, user.id);
  await db.delete(formations).where(eq(formations.id, formationId));
  revalidatePath("/formations");
});

/**
 * « Commencer ». Les formations payantes ne sont pas encore ouvertes : aucun
 * moyen de paiement n'est branché, on refuse plutôt que d'offrir l'accès.
 */
export const enrollInFormation = action(async (formationId: number) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationProgress", user.id);

  const formation = await db.query.formations.findFirst({
    columns: { id: true, creatorId: true, status: true, priceCents: true },
    where: eq(formations.id, formationId),
  });
  if (!formation || formation.status !== "published") throw new UserFacingError("Formation introuvable.");
  if (formation.creatorId === user.id) throw new UserFacingError("Tu es le créateur de cette formation.");
  if (formation.priceCents && formation.priceCents > 0) {
    throw new UserFacingError("Le paiement n'est pas encore activé sur Lockin : cette formation payante n'est pas ouverte aux inscriptions.");
  }

  await db
    .insert(formationEnrollments)
    .values({ formationId, userId: user.id })
    .onConflictDoNothing({ target: [formationEnrollments.formationId, formationEnrollments.userId] });

  revalidateFormation(formationId);
});

/** Coche ou décoche un chapitre — réservé aux inscrits, une ligne par chapitre terminé. */
export const toggleChapterDone = action(async (chapterId: number) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationProgress", user.id);

  const info = await getChapterOwnerInfo(chapterId);
  if (!info) throw new UserFacingError("Chapitre introuvable.");

  const enrollment = await db.query.formationEnrollments.findFirst({
    columns: { id: true },
    where: and(eq(formationEnrollments.formationId, info.formationId), eq(formationEnrollments.userId, user.id)),
  });
  if (!enrollment) throw new UserFacingError("Commence la formation pour suivre ta progression.");

  const existing = await db.query.formationProgress.findFirst({
    columns: { id: true },
    where: and(eq(formationProgress.userId, user.id), eq(formationProgress.chapterId, chapterId)),
  });
  if (existing) {
    await db.delete(formationProgress).where(eq(formationProgress.id, existing.id));
  } else {
    await db
      .insert(formationProgress)
      .values({ userId: user.id, formationId: info.formationId, chapterId })
      .onConflictDoNothing({ target: [formationProgress.userId, formationProgress.chapterId] });
  }

  revalidatePath(`/formations/${info.formationId}`);
  revalidatePath(`/formations/${info.formationId}/analytics`);
});
