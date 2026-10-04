"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  helpAnswers,
  messages,
  moderationEvents,
  moderationReports,
  postComments,
  posts,
} from "@/lib/db/schema";
import { getOrCreateDbUser, requireAdmin } from "@/lib/auth";
import { applyStrike } from "@/lib/moderation/enforce";

const ADMIN_PATH = "/dashboard/admin/moderation";

const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "message", "help_answer"]),
  targetId: z.number().int(),
  reason: z.enum(["insulte", "harcelement", "discrimination", "spam", "autre"]),
  details: z.string().trim().max(500).optional(),
});

/** Résout l'auteur du contenu signalé — un seul champ reportedUserId, pas de jointure à 4 branches au triage. */
async function resolveContentAuthor(
  targetType: z.infer<typeof reportSchema>["targetType"],
  targetId: number,
): Promise<number | null> {
  switch (targetType) {
    case "post": {
      const row = await db.query.posts.findFirst({ where: eq(posts.id, targetId), columns: { userId: true } });
      return row?.userId ?? null;
    }
    case "comment": {
      const row = await db.query.postComments.findFirst({
        where: eq(postComments.id, targetId),
        columns: { userId: true },
      });
      return row?.userId ?? null;
    }
    case "message": {
      const row = await db.query.messages.findFirst({
        where: eq(messages.id, targetId),
        columns: { senderId: true },
      });
      return row?.senderId ?? null;
    }
    case "help_answer": {
      const row = await db.query.helpAnswers.findFirst({
        where: eq(helpAnswers.id, targetId),
        columns: { userId: true },
      });
      return row?.userId ?? null;
    }
  }
}

/** Bouton "Signaler" — disponible sur posts, commentaires, messages, réponses d'entraide. */
export async function reportContent(input: z.infer<typeof reportSchema>) {
  const reporter = await getOrCreateDbUser();
  const parsed = reportSchema.parse(input);

  const reportedUserId = await resolveContentAuthor(parsed.targetType, parsed.targetId);
  if (!reportedUserId) throw new Error("Ce contenu n'existe plus.");
  if (reportedUserId === reporter.id) throw new Error("Tu ne peux pas te signaler toi-même.");

  await db.insert(moderationReports).values({
    reporterId: reporter.id,
    reportedUserId,
    targetType: parsed.targetType,
    targetId: parsed.targetId,
    reason: parsed.reason,
    details: parsed.details,
  });

  return { ok: true as const };
}

// ---------------------------------------------------------------------------
// Dashboard admin — triage humain des signalements, journal des sanctions.
// ---------------------------------------------------------------------------

export async function getModerationOverview() {
  await requireAdmin();

  const [pendingReports, recentEvents] = await Promise.all([
    db.query.moderationReports.findMany({
      where: eq(moderationReports.status, "pending"),
      orderBy: [moderationReports.createdAt],
      with: {
        reporter: { columns: { id: true, name: true } },
        reportedUser: { columns: { id: true, name: true, strikeCount: true, respectScore: true } },
      },
    }),
    db.query.moderationEvents.findMany({
      orderBy: [desc(moderationEvents.createdAt)],
      limit: 30,
      with: { user: { columns: { id: true, name: true } } },
    }),
  ]);

  return { pendingReports, recentEvents };
}

/** Supprime le contenu signalé une fois le signalement confirmé — meilleur effort, ignore si déjà supprimé. */
async function deleteReportedContent(
  targetType: z.infer<typeof reportSchema>["targetType"],
  targetId: number,
) {
  switch (targetType) {
    case "post":
      await db.delete(posts).where(eq(posts.id, targetId));
      return;
    case "comment":
      await db.delete(postComments).where(eq(postComments.id, targetId));
      return;
    case "message":
      await db.delete(messages).where(eq(messages.id, targetId));
      return;
    case "help_answer":
      await db.delete(helpAnswers).where(eq(helpAnswers.id, targetId));
  }
}

const resolveSchema = z.object({
  reportId: z.number().int(),
  decision: z.enum(["uphold", "dismiss"]),
});

/** "Confirmer" applique un strike et supprime le contenu ; "Rejeter" classe sans suite. */
export async function resolveReport(input: z.infer<typeof resolveSchema>) {
  await requireAdmin();
  const parsed = resolveSchema.parse(input);

  const report = await db.query.moderationReports.findFirst({
    where: eq(moderationReports.id, parsed.reportId),
  });
  if (!report) throw new Error("Signalement introuvable");

  if (parsed.decision === "uphold") {
    await applyStrike(report.reportedUserId, "report", report.reason);
    await deleteReportedContent(report.targetType, report.targetId);
  }

  await db
    .update(moderationReports)
    .set({ status: parsed.decision === "uphold" ? "reviewed" : "dismissed", reviewedAt: new Date() })
    .where(eq(moderationReports.id, parsed.reportId));

  revalidatePath(ADMIN_PATH);
}
