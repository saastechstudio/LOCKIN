import { asc, desc, eq } from "drizzle-orm";
import type { UIMessage } from "ai";

import { db } from "@/lib/db";
import { aiConversations, aiMemories } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { CoachChat } from "@/components/dashboard/coach-chat";
import { MemoryPanel } from "@/components/copilot/memory-panel";

export default async function CoachPage() {
  const user = await getOrCreateDbUser();

  const [history, memories] = await Promise.all([
    db.query.aiConversations.findMany({
      where: eq(aiConversations.userId, user.id),
      orderBy: [asc(aiConversations.createdAt)],
      limit: 50,
    }),
    db.query.aiMemories.findMany({
      where: eq(aiMemories.userId, user.id),
      orderBy: [desc(aiMemories.updatedAt)],
      limit: 60,
    }),
  ]);

  const initialMessages: UIMessage[] = history.map((m) => ({
    id: String(m.id),
    role: m.role,
    parts: [{ type: "text", text: m.content }],
  }));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="mb-6">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Life OS · Copilote</p>
          <h1 className="font-display mt-2 text-3xl text-lk-black">{user.aiCoachName ?? "Ton copilote"}</h1>
          <p className="mt-1 text-sm text-lk-stone-3">
            Il connaît tes sphères, tes objectifs et tes habitudes, et se souvient de ce que tu lui confies.
          </p>
        </div>
        <CoachChat initialMessages={initialMessages} />
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <MemoryPanel
          memories={memories.map((m) => ({ id: m.id, kind: m.kind, content: m.content, source: m.source }))}
        />
      </aside>
    </div>
  );
}
