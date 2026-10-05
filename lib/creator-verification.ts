import "server-only";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { creatorVerifications } from "@/lib/db/schema";
import type { CreatorStatus } from "@/lib/formations-data";

/** Statut de vérification d'un membre ; « none » s'il n'a jamais demandé. */
export async function getCreatorVerification(userId: number) {
  const row = await db.query.creatorVerifications.findFirst({
    where: eq(creatorVerifications.userId, userId),
  });
  return {
    status: (row?.status ?? "none") as CreatorStatus,
    decisionNote: row?.decisionNote ?? null,
    legalName: row?.legalName ?? "",
    presentation: row?.presentation ?? "",
    proofUrl: row?.proofUrl ?? "",
  };
}

export async function isVerifiedCreator(userId: number): Promise<boolean> {
  const row = await db.query.creatorVerifications.findFirst({
    columns: { id: true },
    where: and(eq(creatorVerifications.userId, userId), eq(creatorVerifications.status, "approved")),
  });
  return Boolean(row);
}
