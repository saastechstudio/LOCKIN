"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

/**
 * Boîte de réception — une ligne par interlocuteur, avec le dernier
 * message et le nombre de non-lus. Pas de table "conversations" séparée :
 * on regroupe côté JS, le volume reste faible au lancement (même logique
 * que le feed, pas de pagination pour l'instant).
 */
export async function getConversations() {
  const user = await getOrCreateDbUser();

  const rows = await db.query.messages.findMany({
    where: or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id)),
    orderBy: [desc(messages.createdAt)],
    with: {
      sender: { columns: { id: true, name: true, avatarUrl: true } },
      recipient: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });

  const byCounterpart = new Map<
    number,
    { counterpart: { id: number; name: string | null; avatarUrl: string | null }; lastMessage: (typeof rows)[number]; unreadCount: number }
  >();

  for (const m of rows) {
    const counterpart = m.senderId === user.id ? m.recipient : m.sender;
    const existing = byCounterpart.get(counterpart.id);
    const isUnread = m.recipientId === user.id && !m.readAt;

    if (!existing) {
      byCounterpart.set(counterpart.id, {
        counterpart,
        lastMessage: m,
        unreadCount: isUnread ? 1 : 0,
      });
    } else if (isUnread) {
      existing.unreadCount += 1;
    }
  }

  return Array.from(byCounterpart.values()).sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
  );
}

export async function getMessages(otherUserId: number) {
  const user = await getOrCreateDbUser();

  const otherUser = await db.query.users.findFirst({
    where: eq(users.id, otherUserId),
    columns: { id: true, name: true, avatarUrl: true },
  });
  if (!otherUser) return null;

  const thread = await db.query.messages.findMany({
    where: or(
      and(eq(messages.senderId, user.id), eq(messages.recipientId, otherUserId)),
      and(eq(messages.senderId, otherUserId), eq(messages.recipientId, user.id)),
    ),
    orderBy: (fields, { asc }) => [asc(fields.createdAt)],
  });

  // Marque comme lus les messages reçus de cet interlocuteur.
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.senderId, otherUserId),
        eq(messages.recipientId, user.id),
        isNull(messages.readAt),
      ),
    );

  return { otherUser, thread, currentUserId: user.id };
}

const sendMessageSchema = z.object({
  recipientId: z.number().int(),
  content: z.string().trim().min(1).max(2000),
});

export async function sendMessage(input: z.infer<typeof sendMessageSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = sendMessageSchema.parse(input);

  await db.insert(messages).values({
    senderId: user.id,
    recipientId: parsed.recipientId,
    content: parsed.content,
  });

  revalidatePath(`/dashboard/messages/${parsed.recipientId}`);
  revalidatePath("/dashboard/messages");
}
