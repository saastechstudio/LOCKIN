import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getOrCreateDbUser } from "@/lib/auth";
import { fetchMessages, getMembership } from "@/lib/channel/queries";

export const dynamic = "force-dynamic";

const query = z.object({
  c: z.coerce.number().int().positive(),
  after: z.coerce.number().int().nonnegative().optional(),
  before: z.coerce.number().int().positive().optional(),
});

/**
 * Nouveaux messages d'une conversation (`after`) ou page plus ancienne
 * (`before`). L'appartenance est revérifiée à chaque appel : un identifiant
 * deviné ne rend rien.
 */
export async function GET(request: NextRequest) {
  const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  const user = await getOrCreateDbUser();
  const { c, after, before } = parsed.data;
  if (!(await getMembership(user.id, c))) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  const messages = await fetchMessages(user.id, c, { afterId: after, beforeId: before });
  return NextResponse.json({ messages }, { headers: { "Cache-Control": "no-store" } });
}
