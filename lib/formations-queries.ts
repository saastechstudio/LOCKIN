import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  formationEnrollments,
  formationProgress,
  formationQuestions,
  formations,
} from "@/lib/db/schema";
import { FORMATION_LIMITS, FORMATION_THEMES } from "@/lib/formations-data";
import { chapterIdsInOrder, formationAnalytics, nextChapterId, progressPercent } from "@/lib/formations-progress";

/** Résumé d'une formation pour les listes : jamais le contenu des ressources. */
function summarize(f: {
  id: number;
  title: string;
  description: string;
  theme: string;
  level: string;
  durationHours: number;
  priceCents: number | null;
  status: string;
  creator: { id: number; name: string | null; lockinLevel: number };
  modules: { id: number; chapters: { id: number }[] }[];
  enrollments: { id: number }[];
}) {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    theme: f.theme,
    level: f.level,
    durationHours: f.durationHours,
    priceCents: f.priceCents,
    status: f.status,
    creator: f.creator,
    moduleCount: f.modules.length,
    chapterCount: f.modules.reduce((sum, m) => sum + m.chapters.length, 0),
    learnerCount: f.enrollments.length,
  };
}

const LIST_WITH = {
  creator: { columns: { id: true, name: true, lockinLevel: true } },
  modules: { columns: { id: true }, with: { chapters: { columns: { id: true } } } },
  enrollments: { columns: { id: true } },
} as const;

export type FormationSummary = ReturnType<typeof summarize>;

/** Catalogue public (publiées uniquement), paginé : pas de défilement infini. */
export async function listPublishedFormations(opts: { theme?: string; page?: number }) {
  const theme = FORMATION_THEMES.find((t) => t === opts.theme);
  const where = theme
    ? and(eq(formations.status, "published"), eq(formations.theme, theme))
    : eq(formations.status, "published");
  const pageSize = FORMATION_LIMITS.pageSize;
  const total = await db.$count(formations, where);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(opts.page ?? 1) || 1), pageCount);

  const rows = await db.query.formations.findMany({
    where,
    with: LIST_WITH,
    orderBy: [desc(formations.publishedAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { items: rows.map(summarize), page, pageCount, total, theme: theme ?? null };
}

/** Les formations créées par ce membre, brouillons compris. */
export async function listMyFormations(userId: number) {
  const rows = await db.query.formations.findMany({
    where: eq(formations.creatorId, userId),
    with: LIST_WITH,
    orderBy: [desc(formations.updatedAt)],
  });
  return rows.map(summarize);
}

/**
 * Formation complète pour sa page. Règles de visibilité, appliquées ici :
 * - un brouillon n'existe que pour son créateur ;
 * - la structure (titres) est visible de tout membre ;
 * - le contenu des ressources n'est transmis qu'au créateur et aux inscrits
 *   (sinon `content` est vidé et `locked` vaut true) — jamais caché seulement par l'interface.
 */
export async function getFormationView(formationId: number, viewerId: number) {
  const f = await db.query.formations.findFirst({
    where: eq(formations.id, formationId),
    with: {
      creator: { columns: { id: true, name: true, lockinLevel: true, bio: true } },
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: {
          chapters: {
            orderBy: (c, { asc }) => [asc(c.position)],
            with: { resources: { orderBy: (r, { asc }) => [asc(r.position)] } },
          },
        },
      },
      enrollments: { columns: { id: true, userId: true } },
    },
  });
  if (!f) return null;

  const isCreator = f.creatorId === viewerId;
  if (f.status !== "published" && !isCreator) return null;

  const enrolled = f.enrollments.some((e) => e.userId === viewerId);
  const canRead = isCreator || enrolled;

  const doneRows = enrolled
    ? await db.query.formationProgress.findMany({
        columns: { chapterId: true },
        where: and(eq(formationProgress.userId, viewerId), eq(formationProgress.formationId, formationId)),
      })
    : [];
  const doneIds = new Set(doneRows.map((r) => r.chapterId));

  const modules = f.modules.map((m) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    chapters: m.chapters.map((c) => ({
      id: c.id,
      title: c.title,
      position: c.position,
      done: doneIds.has(c.id),
      resources: c.resources.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        position: r.position,
        locked: !canRead,
        content: canRead ? r.content : "",
      })),
    })),
  }));

  const chapterIds = chapterIdsInOrder(modules);
  const done = chapterIds.filter((id) => doneIds.has(id)).length;

  return {
    id: f.id,
    title: f.title,
    description: f.description,
    theme: f.theme,
    level: f.level,
    durationHours: f.durationHours,
    priceCents: f.priceCents,
    status: f.status,
    publishedAt: f.publishedAt,
    creator: f.creator,
    modules,
    learnerCount: f.enrollments.length,
    chapterCount: chapterIds.length,
    viewer: {
      isCreator,
      enrolled,
      doneCount: done,
      percent: progressPercent(done, chapterIds.length),
      nextChapterId: enrolled ? nextChapterId(modules, doneIds) : null,
    },
  };
}

export type FormationView = NonNullable<Awaited<ReturnType<typeof getFormationView>>>;

/**
 * Données de l'écran mentor. Le créateur voit toutes les questions (sans
 * réponse d'abord) ; un apprenant inscrit voit uniquement les siennes ;
 * quiconque d'autre : rien.
 */
export async function getMentorView(formationId: number, viewerId: number) {
  const f = await db.query.formations.findFirst({
    where: eq(formations.id, formationId),
    with: {
      creator: { columns: { id: true, name: true } },
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { chapters: { columns: { id: true, title: true }, orderBy: (c, { asc }) => [asc(c.position)] } },
      },
    },
  });
  if (!f) return null;
  const isCreator = f.creatorId === viewerId;
  if (f.status !== "published" && !isCreator) return null;

  const enrolled = isCreator
    ? false
    : Boolean(
        await db.query.formationEnrollments.findFirst({
          columns: { id: true },
          where: and(eq(formationEnrollments.formationId, formationId), eq(formationEnrollments.userId, viewerId)),
        }),
      );
  if (!isCreator && !enrolled) return { formation: { id: f.id, title: f.title }, role: "outsider" as const };

  const rows = await db.query.formationQuestions.findMany({
    where: isCreator
      ? eq(formationQuestions.formationId, formationId)
      : and(eq(formationQuestions.formationId, formationId), eq(formationQuestions.userId, viewerId)),
    with: {
      user: { columns: { id: true, name: true } },
      chapter: { columns: { id: true, title: true } },
    },
    orderBy: [desc(formationQuestions.createdAt)],
    limit: 100,
  });
  // Mentor : les questions sans réponse d'abord, puis par date.
  const questions = [...rows].sort((a, b) => Number(Boolean(a.answeredAt)) - Number(Boolean(b.answeredAt)));

  return {
    role: isCreator ? ("mentor" as const) : ("learner" as const),
    formation: { id: f.id, title: f.title, creatorName: f.creator.name },
    chapters: f.modules.flatMap((m) => m.chapters.map((c) => ({ id: c.id, title: c.title, moduleTitle: m.title }))),
    questions: questions.map((q) => ({
      id: q.id,
      learner: q.user,
      chapter: q.chapter,
      tried: q.tried,
      question: q.question,
      answer: q.answer,
      nextAction: q.nextAction,
      createdAt: q.createdAt,
      answeredAt: q.answeredAt,
    })),
    pendingCount: rows.filter((q) => !q.answeredAt).length,
  };
}

/** Analytics : réservées au créateur. */
export async function getAnalyticsView(formationId: number, viewerId: number) {
  const f = await db.query.formations.findFirst({
    where: eq(formations.id, formationId),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { chapters: { columns: { id: true, title: true }, orderBy: (c, { asc }) => [asc(c.position)] } },
      },
    },
  });
  if (!f || f.creatorId !== viewerId) return null;

  const chapters = f.modules.flatMap((m) => m.chapters.map((c) => ({ id: c.id, title: c.title, moduleTitle: m.title })));
  const enrollments = await db.query.formationEnrollments.findMany({
    columns: { userId: true },
    where: eq(formationEnrollments.formationId, formationId),
  });
  const userIds = enrollments.map((e) => e.userId);
  const progressRows = userIds.length
    ? await db.query.formationProgress.findMany({
        columns: { userId: true, chapterId: true },
        where: and(eq(formationProgress.formationId, formationId), inArray(formationProgress.userId, userIds)),
      })
    : [];

  const stats = formationAnalytics(
    chapters.map((c) => c.id),
    userIds.map((id) => ({ doneChapterIds: progressRows.filter((r) => r.userId === id).map((r) => r.chapterId) })),
  );
  const pendingQuestions = await db.$count(
    formationQuestions,
    and(eq(formationQuestions.formationId, formationId), isNull(formationQuestions.answeredAt)),
  );

  return {
    formation: { id: f.id, title: f.title, status: f.status },
    chapters,
    stats,
    pendingQuestions,
  };
}
