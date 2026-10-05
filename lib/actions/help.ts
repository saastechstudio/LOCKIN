"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { helpAnswers, helpQuestions, helpUpvotes } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { LOCKIN_TAGS } from "@/lib/social/data";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function getQuestions(tag?: string) {
  const rows = await db.query.helpQuestions.findMany({
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
      answers: { columns: { id: true } },
    },
    orderBy: [desc(helpQuestions.createdAt)],
  });

  const filtered = tag ? rows.filter((q) => q.tags.includes(tag)) : rows;

  return filtered.map((q) => ({ ...q, answerCount: q.answers.length }));
}

export async function getQuestion(id: number) {
  const user = await getOrCreateDbUser();

  const question = await db.query.helpQuestions.findFirst({
    where: eq(helpQuestions.id, id),
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true } },
      answers: {
        orderBy: (fields, { asc }) => [asc(fields.createdAt)],
        with: {
          user: { columns: { id: true, name: true, avatarUrl: true } },
          upvotes: { columns: { userId: true } },
        },
      },
    },
  });
  if (!question) return null;

  // Ordre : la réponse retenue par l'auteur, puis les plus jugées utiles,
  // puis la plus ancienne. Le nombre de « utile » sert au tri, il n'est
  // jamais affiché : pas de course aux votes.
  const answers = question.answers
    .map((a) => ({
      ...a,
      usefulCount: a.upvotes.length,
      usefulByMe: a.upvotes.some((u) => u.userId === user.id),
      accepted: a.id === question.acceptedAnswerId,
      isMine: a.userId === user.id,
    }))
    .sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.usefulCount - a.usefulCount)
    .map((a) => ({
      id: a.id,
      body: a.body,
      createdAt: a.createdAt,
      user: a.user,
      usefulByMe: a.usefulByMe,
      accepted: a.accepted,
      isMine: a.isMine,
    }));

  return { ...question, answers, isMine: question.userId === user.id };
}

const createQuestionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(3000),
  tags: z.array(z.enum(LOCKIN_TAGS)).max(5),
});

export async function createQuestion(input: z.infer<typeof createQuestionSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = createQuestionSchema.parse(input);
  enforceRateLimit("question", user.id);
  await moderateOrThrow(user, `${parsed.title}\n${parsed.body}`);

  const [question] = await db
    .insert(helpQuestions)
    .values({ userId: user.id, title: parsed.title, body: parsed.body, tags: parsed.tags })
    .returning({ id: helpQuestions.id });

  revalidatePath("/dashboard/entraide");
  return question;
}

const addAnswerSchema = z.object({
  questionId: z.number().int(),
  body: z.string().trim().min(1).max(3000),
});

export async function addAnswer(input: z.infer<typeof addAnswerSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = addAnswerSchema.parse(input);
  enforceRateLimit("answer", user.id);
  await moderateOrThrow(user, parsed.body);
  const question = await db.query.helpQuestions.findFirst({
    columns: { id: true },
    where: eq(helpQuestions.id, parsed.questionId),
  });
  if (!question) throw new Error("Cette question n'existe plus.");

  await db.insert(helpAnswers).values({
    questionId: parsed.questionId,
    userId: user.id,
    body: parsed.body,
  });

  revalidatePath(`/dashboard/entraide/${parsed.questionId}`);
}

/** « Utile » : on signale qu'une réponse aide, sans compteur public. Pas sur ses propres réponses. */
export async function toggleUseful(answerId: number, questionId: number) {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("reaction", user.id);

  const answer = await db.query.helpAnswers.findFirst({
    columns: { userId: true, questionId: true },
    where: eq(helpAnswers.id, answerId),
  });
  if (!answer || answer.questionId !== questionId || answer.userId === user.id) return;

  const existing = await db.query.helpUpvotes.findFirst({
    where: and(eq(helpUpvotes.answerId, answerId), eq(helpUpvotes.userId, user.id)),
  });

  if (existing) {
    await db.delete(helpUpvotes).where(eq(helpUpvotes.id, existing.id));
  } else {
    await db.insert(helpUpvotes).values({ answerId, userId: user.id });
  }

  revalidatePath(`/dashboard/entraide/${questionId}`);
}

/**
 * L'auteur de la question retient la réponse qui l'a aidé (ou la retire en
 * la touchant à nouveau). Lui seul peut le faire.
 */
export async function toggleAcceptedAnswer(answerId: number, questionId: number) {
  const user = await getOrCreateDbUser();

  const question = await db.query.helpQuestions.findFirst({
    columns: { userId: true, acceptedAnswerId: true },
    where: eq(helpQuestions.id, questionId),
  });
  if (!question || question.userId !== user.id) {
    throw new Error("Seul l'auteur de la question peut retenir une réponse.");
  }
  const answer = await db.query.helpAnswers.findFirst({
    columns: { questionId: true },
    where: eq(helpAnswers.id, answerId),
  });
  if (!answer || answer.questionId !== questionId) throw new Error("Réponse introuvable.");

  await db
    .update(helpQuestions)
    .set({ acceptedAnswerId: question.acceptedAnswerId === answerId ? null : answerId })
    .where(eq(helpQuestions.id, questionId));

  revalidatePath(`/dashboard/entraide/${questionId}`);
  revalidatePath("/dashboard/entraide");
}
