import "server-only";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { UserFacingError } from "@/lib/action-result";
import { db } from "@/lib/db";
import { formationChapters, formationModules, formationResources, formations } from "@/lib/db/schema";

/** Message volontairement identique pour « n'existe pas » et « pas à toi » : on ne révèle rien. */
const NOT_FOUND = "Introuvable.";

export async function assertOwnsFormation(formationId: number, userId: number) {
  const row = await db.query.formations.findFirst({
    columns: { id: true, creatorId: true, status: true },
    where: eq(formations.id, formationId),
  });
  if (!row || row.creatorId !== userId) throw new UserFacingError(NOT_FOUND);
  return row;
}

export async function assertOwnsModule(moduleId: number, userId: number) {
  const row = await db.query.formationModules.findFirst({
    where: eq(formationModules.id, moduleId),
    with: { formation: { columns: { id: true, creatorId: true } } },
  });
  if (!row || row.formation.creatorId !== userId) throw new UserFacingError(NOT_FOUND);
  return { moduleId: row.id, formationId: row.formationId };
}

export async function assertOwnsChapter(chapterId: number, userId: number) {
  const row = await db.query.formationChapters.findFirst({
    where: eq(formationChapters.id, chapterId),
    with: { module: { columns: { id: true, formationId: true }, with: { formation: { columns: { creatorId: true } } } } },
  });
  if (!row || row.module.formation.creatorId !== userId) throw new UserFacingError(NOT_FOUND);
  return { chapterId: row.id, moduleId: row.moduleId, formationId: row.module.formationId };
}

export async function assertOwnsResource(resourceId: number, userId: number) {
  const row = await db.query.formationResources.findFirst({
    where: eq(formationResources.id, resourceId),
    with: {
      chapter: {
        columns: { id: true, moduleId: true },
        with: { module: { columns: { formationId: true }, with: { formation: { columns: { creatorId: true } } } } },
      },
    },
  });
  if (!row || row.chapter.module.formation.creatorId !== userId) throw new UserFacingError(NOT_FOUND);
  return { resourceId: row.id, chapterId: row.chapterId, formationId: row.chapter.module.formationId };
}

/** À quelle formation appartient ce chapitre ? Sert aux apprenants (progression, questions). */
export async function getChapterOwnerInfo(chapterId: number) {
  const row = await db.query.formationChapters.findFirst({
    where: eq(formationChapters.id, chapterId),
    with: { module: { columns: { formationId: true }, with: { formation: { columns: { creatorId: true, status: true } } } } },
  });
  if (!row) return null;
  return {
    chapterId: row.id,
    formationId: row.module.formationId,
    creatorId: row.module.formation.creatorId,
    status: row.module.formation.status,
  };
}

export async function touchFormation(formationId: number) {
  await db.update(formations).set({ updatedAt: new Date() }).where(eq(formations.id, formationId));
}

export function revalidateFormation(formationId: number) {
  revalidatePath("/formations");
  revalidatePath(`/formations/${formationId}`);
  revalidatePath(`/formations/${formationId}/builder`);
  revalidatePath(`/formations/${formationId}/mentor`);
  revalidatePath(`/formations/${formationId}/analytics`);
}
