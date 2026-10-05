"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { action, UserFacingError } from "@/lib/action-result";

import { db } from "@/lib/db";
import { formationEnrollments, formationQuestions, formations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";
import { FORMATION_LIMITS } from "@/lib/formations-data";
import { getChapterOwnerInfo } from "@/lib/formations-access";

const MIN = 10;

const askSchema = z.object({
  formationId: z.number().int(),
  chapterId: z.number().int().nullable().optional(),
  // Question disciplinée : on dit d'abord ce qu'on a déjà tenté.
  tried: z.string().trim().min(MIN, `Dis ce que tu as déjà essayé (${MIN} caractères minimum).`).max(FORMATION_LIMITS.question),
  question: z.string().trim().min(MIN, `Formule ta question (${MIN} caractères minimum).`).max(FORMATION_LIMITS.question),
});

/** Un apprenant inscrit pose une question au mentor (le créateur). Jamais le créateur à lui-même. */
export const askMentorQuestion = action(async (input: z.infer<typeof askSchema>) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationQuestion", user.id);
  const parsed = askSchema.parse(input);
  await moderateOrThrow(user, `${parsed.tried}\n${parsed.question}`);

  const formation = await db.query.formations.findFirst({
    columns: { id: true, creatorId: true, status: true },
    where: eq(formations.id, parsed.formationId),
  });
  if (!formation || formation.status !== "published") throw new UserFacingError("Formation introuvable.");
  if (formation.creatorId === user.id) throw new UserFacingError("Tu es le mentor de cette formation.");

  const enrolled = await db.query.formationEnrollments.findFirst({
    columns: { id: true },
    where: and(eq(formationEnrollments.formationId, parsed.formationId), eq(formationEnrollments.userId, user.id)),
  });
  if (!enrolled) throw new UserFacingError("Commence la formation pour interroger son mentor.");

  if (parsed.chapterId) {
    const chapter = await getChapterOwnerInfo(parsed.chapterId);
    if (!chapter || chapter.formationId !== parsed.formationId) throw new UserFacingError("Chapitre introuvable.");
  }

  await db.insert(formationQuestions).values({
    formationId: parsed.formationId,
    chapterId: parsed.chapterId ?? null,
    userId: user.id,
    tried: parsed.tried,
    question: parsed.question,
  });
  revalidatePath(`/formations/${parsed.formationId}/mentor`);
});

const answerSchema = z.object({
  questionId: z.number().int(),
  answer: z.string().trim().min(MIN, `Réponse : ${MIN} caractères minimum.`).max(FORMATION_LIMITS.answer),
  // Réponse structurée : une réponse, puis une action concrète à faire.
  nextAction: z.string().trim().min(3, "Indique la prochaine action.").max(500),
});

/** Seul le créateur de la formation répond : réponse + prochaine action. */
export const answerMentorQuestion = action(async (input: z.infer<typeof answerSchema>) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("formationAnswer", user.id);
  const parsed = answerSchema.parse(input);

  const question = await db.query.formationQuestions.findFirst({
    columns: { id: true, formationId: true },
    where: eq(formationQuestions.id, parsed.questionId),
    with: { formation: { columns: { creatorId: true } } },
  });
  if (!question || question.formation.creatorId !== user.id) throw new UserFacingError("Introuvable.");
  await moderateOrThrow(user, `${parsed.answer}\n${parsed.nextAction}`);

  await db
    .update(formationQuestions)
    .set({ answer: parsed.answer, nextAction: parsed.nextAction, answeredAt: new Date() })
    .where(eq(formationQuestions.id, parsed.questionId));
  revalidatePath(`/formations/${question.formationId}/mentor`);
});
