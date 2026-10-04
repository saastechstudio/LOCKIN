"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { helpAnswers, helpQuestions, helpUpvotes } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { LOCKIN_TAGS } from "@/lib/social/data";

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

  const answers = question.answers
    .map((a) => ({
      ...a,
      upvoteCount: a.upvotes.length,
      upvotedByMe: a.upvotes.some((u) => u.userId === user.id),
    }))
    // Meilleures réponses en avant — upvotes desc, puis plus ancien d'abord à égalité.
    .sort((a, b) => b.upvoteCount - a.upvoteCount);

  return { ...question, answers };
}

const createQuestionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(3000),
  tags: z.array(z.enum(LOCKIN_TAGS)).max(5),
});

export async function createQuestion(input: z.infer<typeof createQuestionSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = createQuestionSchema.parse(input);

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

  await db.insert(helpAnswers).values({
    questionId: parsed.questionId,
    userId: user.id,
    body: parsed.body,
  });

  revalidatePath(`/dashboard/entraide/${parsed.questionId}`);
}

export async function toggleUpvote(answerId: number, questionId: number) {
  const user = await getOrCreateDbUser();

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
