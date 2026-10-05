"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { businessOffers } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { moderateOrThrow } from "@/lib/moderation/enforce";
import { BUSINESS_KINDS } from "@/lib/business-data";

/** Mode Business : annonces entre membres — offres, recherches, partenariats. */
export async function getBusinessOffers(kind?: string) {
  const me = await getOrCreateDbUser();
  const validKind = BUSINESS_KINDS.find((k) => k === kind);
  const rows = await db.query.businessOffers.findMany({
    where: validKind ? eq(businessOffers.kind, validKind) : undefined,
    with: { user: { columns: { id: true, name: true, lockinLevel: true, sector: true } } },
    orderBy: [desc(businessOffers.createdAt)],
    limit: 100,
  });
  return rows.map((o) => ({ ...o, isMine: o.userId === me.id }));
}

const offerSchema = z.object({
  kind: z.enum(BUSINESS_KINDS),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(2000),
  location: z.string().trim().max(80).optional(),
});

/** Publication modérée comme le reste du club (filtre + sanctions, puis signalements). */
export async function createBusinessOffer(input: z.infer<typeof offerSchema>) {
  const me = await getOrCreateDbUser();
  const parsed = offerSchema.parse(input);
  await moderateOrThrow(me, `${parsed.title}\n${parsed.body}`);

  await db.insert(businessOffers).values({
    userId: me.id,
    kind: parsed.kind,
    title: parsed.title,
    body: parsed.body,
    location: parsed.location || null,
  });
  revalidatePath("/dashboard/business");
}

export async function deleteBusinessOffer(offerId: number) {
  const me = await getOrCreateDbUser();
  await db
    .delete(businessOffers)
    .where(and(eq(businessOffers.id, offerId), eq(businessOffers.userId, me.id)));
  revalidatePath("/dashboard/business");
}
