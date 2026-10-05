"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { action, UserFacingError } from "@/lib/action-result";
import { db } from "@/lib/db";
import { creatorVerifications, formations, notifications } from "@/lib/db/schema";
import { getOrCreateDbUser, requireAdmin } from "@/lib/auth";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  canTransition,
  decisionSchema,
  submitVerificationSchema,
  type DecisionInput,
  type SubmitVerificationInput,
} from "@/lib/creator-verification-data";

/**
 * Un membre demande à devenir créateur vérifié. Une demande par membre :
 * refusée, il peut la corriger et la renvoyer ; en cours ou approuvée, non.
 */
export const submitCreatorVerification = action(async (input: SubmitVerificationInput) => {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("creatorVerification", user.id);
  const parsed = submitVerificationSchema.parse(input);
  await moderateOrThrow(user, `${parsed.legalName}\n${parsed.presentation}`);

  const existing = await db.query.creatorVerifications.findFirst({
    where: eq(creatorVerifications.userId, user.id),
  });
  if (existing?.status === "approved") throw new UserFacingError("Tu es déjà créateur vérifié.");
  if (existing?.status === "pending") throw new UserFacingError("Ta demande est déjà en cours d'examen.");

  const values = {
    legalName: parsed.legalName,
    presentation: parsed.presentation,
    proofUrl: parsed.proofUrl,
    status: "pending",
    decisionNote: null,
    reviewedBy: null,
    reviewedAt: null,
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(creatorVerifications).set(values).where(eq(creatorVerifications.id, existing.id));
  } else {
    await db.insert(creatorVerifications).values({ userId: user.id, ...values }).onConflictDoNothing();
  }

  revalidatePath("/formations/verification");
  revalidatePath("/dashboard/admin/creators");
});

const MESSAGES = {
  approve: {
    title: "Tu es créateur vérifié",
    body: "Ton identité a été validée : tu peux publier tes formations.",
  },
  reject: {
    title: "Demande de vérification refusée",
    body: "Ta demande de créateur vérifié n'a pas été acceptée. Le motif est indiqué sur la page de vérification ; tu peux la corriger et la renvoyer.",
  },
  revoke: {
    title: "Vérification retirée",
    body: "Ton statut de créateur vérifié a été retiré et tes formations repassent en brouillon. Le motif est indiqué sur la page de vérification.",
  },
} as const;

/** Décision d'un administrateur : approuver, refuser ou retirer. Un retrait dépublie les formations du membre. */
export const decideCreatorVerification = action(async (input: DecisionInput) => {
  const admin = await requireAdmin();
  enforceRateLimit("creatorDecision", admin.id);
  const parsed = decisionSchema.parse(input);

  const verification = await db.query.creatorVerifications.findFirst({
    where: eq(creatorVerifications.id, parsed.verificationId),
  });
  if (!verification) throw new UserFacingError("Demande introuvable.");
  if (!canTransition(verification.status, parsed.decision)) {
    throw new UserFacingError("Cette décision n'est pas possible dans l'état actuel de la demande.");
  }

  const approved = parsed.decision === "approve";
  await db
    .update(creatorVerifications)
    .set({
      status: approved ? "approved" : "rejected",
      decisionNote: approved ? null : (parsed.note ?? null),
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(creatorVerifications.id, verification.id));

  if (parsed.decision === "revoke") {
    await db
      .update(formations)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(formations.creatorId, verification.userId));
  }

  // Une notification « système » par membre et par jour (index unique) : si une existe déjà, la page de vérification fait foi.
  const message = MESSAGES[parsed.decision];
  await db
    .insert(notifications)
    .values({ userId: verification.userId, type: "system", title: message.title, body: message.body, sendDate: new Date() })
    .onConflictDoNothing();

  revalidatePath("/dashboard/admin/creators");
  revalidatePath("/formations/verification");
  revalidatePath("/formations");
});
