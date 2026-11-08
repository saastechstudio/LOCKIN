import "server-only";

import { and, asc, count, desc, eq, gt, inArray, isNull, max, ne, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  chatMessages,
  chatReactions,
  conversationMembers,
  conversations,
  pacts,
  userBlocks,
  users,
  type Conversation,
  type ConversationKind,
} from "@/lib/db/schema";
import { PAGE_SIZE } from "./constants";

/**
 * Lecture de la messagerie. Toute fonction prend l'identifiant du membre qui
 * regarde et ne rend que ce que ce membre a le droit de voir : appartenance
 * à la conversation vérifiée, membres bloqués (dans les deux sens) masqués.
 */

export type Person = { id: number; name: string | null; avatarUrl: string | null };

export type ChannelMessage = {
  id: number;
  conversationId: number;
  kind: "text" | "checkin" | "system";
  body: string;
  createdAt: string;
  deleted: boolean;
  sender: Person;
  mine: boolean;
  replyTo: { id: number; body: string; senderName: string | null } | null;
  reactions: { emoji: string; count: number; mine: boolean }[];
};

export type InboxItem = {
  id: number;
  kind: ConversationKind;
  title: string;
  topic: string | null;
  people: Person[];
  lastMessage: { body: string; createdAt: string; senderName: string | null; mine: boolean; kind: string } | null;
  lastMessageAt: string;
  unread: number;
  pact: { id: number; status: "pending" | "active" | "ended"; iAmPartner: boolean } | null;
  linked: { goalId: number | null; habitId: number | null; sphereId: number | null };
};

const personColumns = { id: true, name: true, avatarUrl: true } as const;

export async function getMembership(userId: number, conversationId: number) {
  return db.query.conversationMembers.findFirst({
    where: and(eq(conversationMembers.userId, userId), eq(conversationMembers.conversationId, conversationId)),
  });
}

/** Identifiants des membres que `userId` a bloqués ou qui l'ont bloqué. */
export async function blockedWith(userId: number): Promise<Set<number>> {
  const rows = await db.query.userBlocks.findMany({
    where: or(eq(userBlocks.blockerId, userId), eq(userBlocks.blockedId, userId)),
  });
  return new Set(rows.map((r) => (r.blockerId === userId ? r.blockedId : r.blockerId)));
}

export function conversationTitle(
  conversation: Pick<Conversation, "kind" | "title">,
  people: Person[],
  me: number,
): string {
  if (conversation.title) return conversation.title;
  const others = people.filter((p) => p.id !== me);
  if (others.length === 0) return "Conversation";
  if (conversation.kind === "direct" || conversation.kind === "pact") return others[0].name ?? "Membre";
  return others
    .slice(0, 3)
    .map((p) => (p.name ?? "Membre").split(" ")[0])
    .join(", ");
}

export async function listInbox(userId: number): Promise<InboxItem[]> {
  const memberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, userId),
    with: {
      conversation: {
        with: {
          members: { with: { user: { columns: personColumns } } },
          pact: true,
        },
      },
    },
  });
  if (memberships.length === 0) return [];
  const ids = memberships.map((m) => m.conversationId);
  const blocked = await blockedWith(userId);

  const latest = await db
    .select({ conversationId: chatMessages.conversationId, lastId: max(chatMessages.id) })
    .from(chatMessages)
    .where(and(inArray(chatMessages.conversationId, ids), isNull(chatMessages.deletedAt)))
    .groupBy(chatMessages.conversationId);
  const lastIds = latest.map((l) => l.lastId).filter((v): v is number => v !== null);
  const lastMessages = lastIds.length
    ? await db.query.chatMessages.findMany({
        where: inArray(chatMessages.id, lastIds),
        with: { sender: { columns: personColumns } },
      })
    : [];
  const lastByConversation = new Map(lastMessages.map((m) => [m.conversationId, m]));

  const unreadRows = await db
    .select({ conversationId: chatMessages.conversationId, n: count() })
    .from(chatMessages)
    .innerJoin(
      conversationMembers,
      and(eq(conversationMembers.conversationId, chatMessages.conversationId), eq(conversationMembers.userId, userId)),
    )
    .where(
      and(
        inArray(chatMessages.conversationId, ids),
        ne(chatMessages.senderId, userId),
        isNull(chatMessages.deletedAt),
        sql`${chatMessages.createdAt} > coalesce(${conversationMembers.lastReadAt}, 'epoch'::timestamp)`,
      ),
    )
    .groupBy(chatMessages.conversationId);
  const unread = new Map(unreadRows.map((r) => [r.conversationId, r.n]));

  return memberships
    .map((m): InboxItem => {
      const c = m.conversation;
      const people = c.members.map((x) => x.user);
      const last = lastByConversation.get(c.id);
      const hidden = last && blocked.has(last.senderId) && last.senderId !== userId;
      return {
        id: c.id,
        kind: c.kind,
        title: conversationTitle(c, people, userId),
        topic: c.topic,
        people,
        lastMessage:
          last && !hidden
            ? {
                body: last.body,
                createdAt: last.createdAt.toISOString(),
                senderName: last.sender.name,
                mine: last.senderId === userId,
                kind: last.kind,
              }
            : null,
        lastMessageAt: c.lastMessageAt.toISOString(),
        unread: unread.get(c.id) ?? 0,
        pact: c.pact
          ? { id: c.pact.id, status: c.pact.status, iAmPartner: c.pact.partnerId === userId }
          : null,
        linked: { goalId: c.goalId, habitId: c.habitId, sphereId: c.sphereId },
      };
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function fetchMessages(
  userId: number,
  conversationId: number,
  options: { afterId?: number; beforeId?: number; limit?: number } = {},
): Promise<ChannelMessage[]> {
  const limit = Math.min(options.limit ?? PAGE_SIZE, 200);
  const blocked = await blockedWith(userId);

  const where = and(
    eq(chatMessages.conversationId, conversationId),
    options.afterId ? gt(chatMessages.id, options.afterId) : undefined,
    options.beforeId ? sql`${chatMessages.id} < ${options.beforeId}` : undefined,
  );
  const rows = await db.query.chatMessages.findMany({
    where,
    orderBy: options.afterId ? [asc(chatMessages.id)] : [desc(chatMessages.id)],
    limit,
    with: { sender: { columns: personColumns } },
  });
  const visible = rows.filter((m) => m.senderId === userId || !blocked.has(m.senderId));
  const ordered = options.afterId ? visible : visible.reverse();
  if (ordered.length === 0) return [];

  const messageIds = ordered.map((m) => m.id);
  const reactions = await db.query.chatReactions.findMany({ where: inArray(chatReactions.messageId, messageIds) });
  const replyIds = [...new Set(ordered.map((m) => m.replyToId).filter((v): v is number => v !== null))];
  const replies = replyIds.length
    ? await db.query.chatMessages.findMany({
        where: inArray(chatMessages.id, replyIds),
        with: { sender: { columns: personColumns } },
      })
    : [];
  const replyById = new Map(replies.map((r) => [r.id, r]));

  return ordered.map((m): ChannelMessage => {
    const mine = reactions.filter((r) => r.messageId === m.id);
    const grouped = new Map<string, { count: number; mine: boolean }>();
    for (const r of mine) {
      const entry = grouped.get(r.emoji) ?? { count: 0, mine: false };
      entry.count += 1;
      entry.mine ||= r.userId === userId;
      grouped.set(r.emoji, entry);
    }
    const reply = m.replyToId ? replyById.get(m.replyToId) : undefined;
    return {
      id: m.id,
      conversationId: m.conversationId,
      kind: m.kind,
      body: m.deletedAt ? "" : m.body,
      createdAt: m.createdAt.toISOString(),
      deleted: Boolean(m.deletedAt),
      sender: m.sender,
      mine: m.senderId === userId,
      replyTo:
        reply && !reply.deletedAt
          ? { id: reply.id, body: reply.body.slice(0, 120), senderName: reply.sender.name }
          : null,
      reactions: [...grouped.entries()].map(([emoji, v]) => ({ emoji, ...v })),
    };
  });
}

export async function getConversationFor(userId: number, conversationId: number) {
  const membership = await getMembership(userId, conversationId);
  if (!membership) return null;
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      members: { with: { user: { columns: personColumns } } },
      pact: true,
    },
  });
  if (!conversation) return null;
  const people = conversation.members.map((m) => m.user);
  return {
    conversation,
    people,
    title: conversationTitle(conversation, people, userId),
    membership,
  };
}

export async function totalUnread(userId: number): Promise<number> {
  const inbox = await listInbox(userId);
  return inbox.reduce((sum, c) => sum + c.unread, 0);
}

/** Salons thématiques ouverts : ceux que le membre n'a pas encore rejoints. */
export async function listOpenRooms(userId: number) {
  const mine = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, userId),
    columns: { conversationId: true },
  });
  const mineIds = new Set(mine.map((m) => m.conversationId));
  const rooms = await db.query.conversations.findMany({
    where: eq(conversations.kind, "room"),
    orderBy: [desc(conversations.lastMessageAt)],
    limit: 40,
    with: { members: { columns: { id: true } } },
  });
  return rooms
    .filter((r) => !mineIds.has(r.id))
    .map((r) => ({ id: r.id, title: r.title ?? "Salon", topic: r.topic, members: r.members.length }));
}

export async function pendingPactInvites(userId: number) {
  return db.query.pacts.findMany({
    where: and(eq(pacts.partnerId, userId), eq(pacts.status, "pending")),
    with: { initiator: { columns: personColumns } },
  });
}

export async function searchMembers(userId: number, query: string): Promise<Person[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const blocked = await blockedWith(userId);
  const rows = await db.query.users.findMany({
    columns: personColumns,
    where: and(ne(users.id, userId), sql`${users.name} ILIKE ${"%" + q.replace(/[%_\\]/g, "\\$&") + "%"}`),
    limit: 12,
  });
  return rows.filter((u) => !blocked.has(u.id)).slice(0, 8);
}

/** Pour SphereLife : les membres des conversations privées et pactes liées à chaque sphère. */
export async function sphereContacts(userId: number): Promise<Record<number, { id: number; name: string }[]>> {
  const rows = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, userId),
    with: {
      conversation: {
        columns: { id: true, kind: true, sphereId: true },
        with: { members: { with: { user: { columns: { id: true, name: true } } } }, pact: { columns: { status: true } } },
      },
    },
  });
  const blocked = await blockedWith(userId);
  const out: Record<number, { id: number; name: string }[]> = {};
  for (const { conversation: c } of rows) {
    if (!c.sphereId || (c.kind !== "direct" && c.kind !== "pact") || c.pact?.status === "ended") continue;
    for (const m of c.members) {
      if (m.userId === userId || blocked.has(m.userId)) continue;
      const list = (out[c.sphereId] ??= []);
      if (!list.some((p) => p.id === m.userId)) list.push({ id: m.userId, name: m.user.name ?? "Membre" });
    }
  }
  return out;
}
