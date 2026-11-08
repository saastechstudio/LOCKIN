import { NextResponse } from "next/server";

import { getOrCreateDbUser } from "@/lib/auth";
import { listInbox } from "@/lib/channel/queries";

export const dynamic = "force-dynamic";

/** Boîte de réception : interrogée toutes les quelques secondes par la liste des conversations. */
export async function GET() {
  const user = await getOrCreateDbUser();
  const inbox = await listInbox(user.id);
  return NextResponse.json({ inbox }, { headers: { "Cache-Control": "no-store" } });
}
