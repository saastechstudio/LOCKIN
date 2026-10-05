"use server";

import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { action, UserFacingError } from "@/lib/action-result";

import { db } from "@/lib/db";
import { formationChapters, formationModules, formationResources } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isHttpsUrl } from "@/lib/safe-url";
import { FORMATION_LIMITS, RESOURCE_TYPES } from "@/lib/formations-data";
import { isSamePermutation } from "@/lib/formations-progress";
import {
  assertOwnsChapter,
  assertOwnsFormation,
  assertOwnsModule,
  assertOwnsResource,
  revalidateFormation,
  touchFormation,
} from "@/lib/formations-access";

/** Chaque édition : membre du club, débit limité, puis vérification de propriété dans l'action. */
async function editor() {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationEdit", user.id);
  return user;
}

const titleSchema = z.string().trim().min(1, "Un titre est requis.").max(FORMATION_LIMITS.title);

async function done(formationId: number) {
  await touchFormation(formationId);
  revalidateFormation(formationId);
}

// ---------------------------------------------------------------- modules

export const addModule = action(async (formationId: number, title: string) => {
  const user = await editor();
  await assertOwnsFormation(formationId, user.id);
  const clean = titleSchema.parse(title);
  await moderateOrThrow(user, clean);

  const count = await db.$count(formationModules, eq(formationModules.formationId, formationId));
  if (count >= FORMATION_LIMITS.modules) throw new UserFacingError(`Maximum ${FORMATION_LIMITS.modules} modules par formation.`);

  await db.insert(formationModules).values({ formationId, title: clean, position: count });
  await done(formationId);
});

export const renameModule = action(async (moduleId: number, title: string) => {
  const user = await editor();
  const { formationId } = await assertOwnsModule(moduleId, user.id);
  const clean = titleSchema.parse(title);
  await moderateOrThrow(user, clean);
  await db.update(formationModules).set({ title: clean }).where(eq(formationModules.id, moduleId));
  await done(formationId);
});

export const deleteModule = action(async (moduleId: number) => {
  const user = await editor();
  const { formationId } = await assertOwnsModule(moduleId, user.id);
  await db.delete(formationModules).where(eq(formationModules.id, moduleId));
  await compactModules(formationId);
  await done(formationId);
});

/** Les positions restent 0..n-1 sans trou après une suppression. */
async function compactModules(formationId: number) {
  const rows = await db.query.formationModules.findMany({
    columns: { id: true },
    where: eq(formationModules.formationId, formationId),
    orderBy: [asc(formationModules.position)],
  });
  for (const [i, row] of rows.entries()) {
    await db.update(formationModules).set({ position: i }).where(eq(formationModules.id, row.id));
  }
}

export const reorderModules = action(async (formationId: number, orderedIds: number[]) => {
  const user = await editor();
  await assertOwnsFormation(formationId, user.id);
  const ids = z.array(z.number().int()).max(FORMATION_LIMITS.modules).parse(orderedIds);
  const current = await db.query.formationModules.findMany({
    columns: { id: true },
    where: eq(formationModules.formationId, formationId),
  });
  if (!isSamePermutation(current.map((m) => m.id), ids)) throw new UserFacingError("Ordre invalide.");
  for (const [i, id] of ids.entries()) {
    await db
      .update(formationModules)
      .set({ position: i })
      .where(and(eq(formationModules.id, id), eq(formationModules.formationId, formationId)));
  }
  await done(formationId);
});

// --------------------------------------------------------------- chapitres

export const addChapter = action(async (moduleId: number, title: string) => {
  const user = await editor();
  const { formationId } = await assertOwnsModule(moduleId, user.id);
  const clean = titleSchema.parse(title);
  await moderateOrThrow(user, clean);

  const count = await db.$count(formationChapters, eq(formationChapters.moduleId, moduleId));
  if (count >= FORMATION_LIMITS.chaptersPerModule) {
    throw new UserFacingError(`Maximum ${FORMATION_LIMITS.chaptersPerModule} chapitres par module.`);
  }
  await db.insert(formationChapters).values({ moduleId, title: clean, position: count });
  await done(formationId);
});

export const renameChapter = action(async (chapterId: number, title: string) => {
  const user = await editor();
  const { formationId } = await assertOwnsChapter(chapterId, user.id);
  const clean = titleSchema.parse(title);
  await moderateOrThrow(user, clean);
  await db.update(formationChapters).set({ title: clean }).where(eq(formationChapters.id, chapterId));
  await done(formationId);
});

export const deleteChapter = action(async (chapterId: number) => {
  const user = await editor();
  const { formationId, moduleId } = await assertOwnsChapter(chapterId, user.id);
  await db.delete(formationChapters).where(eq(formationChapters.id, chapterId));
  const rows = await db.query.formationChapters.findMany({
    columns: { id: true },
    where: eq(formationChapters.moduleId, moduleId),
    orderBy: [asc(formationChapters.position)],
  });
  for (const [i, row] of rows.entries()) {
    await db.update(formationChapters).set({ position: i }).where(eq(formationChapters.id, row.id));
  }
  await done(formationId);
});

export const reorderChapters = action(async (moduleId: number, orderedIds: number[]) => {
  const user = await editor();
  const { formationId } = await assertOwnsModule(moduleId, user.id);
  const ids = z.array(z.number().int()).max(FORMATION_LIMITS.chaptersPerModule).parse(orderedIds);
  const current = await db.query.formationChapters.findMany({
    columns: { id: true },
    where: eq(formationChapters.moduleId, moduleId),
  });
  if (!isSamePermutation(current.map((c) => c.id), ids)) throw new UserFacingError("Ordre invalide.");
  for (const [i, id] of ids.entries()) {
    await db
      .update(formationChapters)
      .set({ position: i })
      .where(and(eq(formationChapters.id, id), eq(formationChapters.moduleId, moduleId)));
  }
  await done(formationId);
});

// -------------------------------------------------------------- ressources

const resourceSchema = z
  .object({
    type: z.enum(RESOURCE_TYPES),
    title: titleSchema,
    content: z.string().trim().min(1, "Le contenu est requis."),
  })
  .superRefine((value, ctx) => {
    if (value.type === "text") {
      if (value.content.length > FORMATION_LIMITS.textContent) {
        ctx.addIssue({ code: "custom", path: ["content"], message: `Texte : ${FORMATION_LIMITS.textContent} caractères maximum.` });
      }
      return;
    }
    // Vidéo, audio, PDF : une adresse https, pas d'hébergement de fichier sur Lockin.
    if (value.content.length > FORMATION_LIMITS.urlContent || !isHttpsUrl(value.content)) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "Colle une adresse https:// valide." });
    }
  });

export type ResourceInput = z.infer<typeof resourceSchema>;

export const addResource = action(async (chapterId: number, input: ResourceInput) => {
  const user = await editor();
  const { formationId } = await assertOwnsChapter(chapterId, user.id);
  const parsed = resourceSchema.parse(input);
  await moderateOrThrow(user, parsed.type === "text" ? `${parsed.title}\n${parsed.content}` : parsed.title);

  const count = await db.$count(formationResources, eq(formationResources.chapterId, chapterId));
  if (count >= FORMATION_LIMITS.resourcesPerChapter) {
    throw new UserFacingError(`Maximum ${FORMATION_LIMITS.resourcesPerChapter} ressources par chapitre.`);
  }
  await db.insert(formationResources).values({ chapterId, ...parsed, position: count });
  await done(formationId);
});

/** Le type d'une ressource ne change pas : pour passer de texte à vidéo, on la remplace. */
export const updateResource = action(async (resourceId: number, input: { title: string; content: string }) => {
  const user = await editor();
  const { formationId } = await assertOwnsResource(resourceId, user.id);
  const existing = await db.query.formationResources.findFirst({
    columns: { type: true },
    where: eq(formationResources.id, resourceId),
  });
  if (!existing) throw new UserFacingError("Introuvable.");
  const parsed = resourceSchema.parse({ type: existing.type, ...input });
  await moderateOrThrow(user, parsed.type === "text" ? `${parsed.title}\n${parsed.content}` : parsed.title);
  await db
    .update(formationResources)
    .set({ title: parsed.title, content: parsed.content })
    .where(eq(formationResources.id, resourceId));
  await done(formationId);
});

export const deleteResource = action(async (resourceId: number) => {
  const user = await editor();
  const { formationId, chapterId } = await assertOwnsResource(resourceId, user.id);
  await db.delete(formationResources).where(eq(formationResources.id, resourceId));
  const rows = await db.query.formationResources.findMany({
    columns: { id: true },
    where: eq(formationResources.chapterId, chapterId),
    orderBy: [asc(formationResources.position)],
  });
  for (const [i, row] of rows.entries()) {
    await db.update(formationResources).set({ position: i }).where(eq(formationResources.id, row.id));
  }
  await done(formationId);
});

export const reorderResources = action(async (chapterId: number, orderedIds: number[]) => {
  const user = await editor();
  const { formationId } = await assertOwnsChapter(chapterId, user.id);
  const ids = z.array(z.number().int()).max(FORMATION_LIMITS.resourcesPerChapter).parse(orderedIds);
  const current = await db.query.formationResources.findMany({
    columns: { id: true },
    where: eq(formationResources.chapterId, chapterId),
  });
  if (!isSamePermutation(current.map((r) => r.id), ids)) throw new UserFacingError("Ordre invalide.");
  for (const [i, id] of ids.entries()) {
    await db
      .update(formationResources)
      .set({ position: i })
      .where(and(eq(formationResources.id, id), eq(formationResources.chapterId, chapterId)));
  }
  await done(formationId);
});
