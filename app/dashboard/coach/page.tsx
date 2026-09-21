import { asc, eq } from "drizzle-orm";
import type { UIMessage } from "ai";

import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { CoachChat } from "@/components/dashboard/coach-chat";

export default async function CoachPage() {
  const user = await getOrCreateDbUser();

  const history = await db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, user.id),
    orderBy: [asc(aiConversations.createdAt)],
    limit: 50,
  });

  const initialMessages: UIMessage[] = history.map((m) => ({
    id: String(m.id),
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-foreground">Coach Lock In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ton mentor exigeant, disponible 24/7 pour challenger ton exécution.
        </p>
      </div>
      <CoachChat initialMessages={initialMessages} />
    </div>
  );
}
