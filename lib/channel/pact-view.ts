import "server-only";

import { and, desc, eq, inArray, max, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { chatMessages, pacts, users, type User } from "@/lib/db/schema";
import { loadLifeOs, type LifeOsSnapshot } from "@/lib/life-os/snapshot";
import { pactSignals, type PactSignal, type PartnerSnapshot } from "./pact";

/**
 * Vue d'accountability d'un pacte actif : l'avancée du partenaire (score,
 * objectifs, habitudes) et les signaux du copilote. Elle ne se construit que
 * pour un pacte accepté dont le demandeur est membre : l'acceptation vaut
 * consentement, et terminer le pacte coupe l'accès.
 */

export type PactCard = {
  name: string;
  avatarUrl: string | null;
  score: number;
  tier: string;
  scoreDelta: number | null;
  focusWeekMinutes: number;
  goals: { title: string; progress: number; pace: string }[];
  habits: { label: string; streak: number; doneToday: boolean }[];
};

export type PactView = {
  pactId: number;
  partner: PactCard;
  me: PactCard;
  signals: PactSignal[];
};

function card(user: { name: string | null; avatarUrl: string | null }, s: LifeOsSnapshot): PactCard {
  return {
    name: user.name ?? "Membre",
    avatarUrl: user.avatarUrl,
    score: s.score.score,
    tier: s.tier.label,
    scoreDelta: s.yesterdayScore === null ? null : s.score.score - s.yesterdayScore,
    focusWeekMinutes: s.focus.weekMinutes,
    goals: s.goals
      .filter((g) => g.progress < 100)
      .slice(0, 4)
      .map((g) => ({ title: g.title, progress: g.progress, pace: g.pace })),
    habits: s.habits.slice(0, 4).map((h) => ({ label: h.label, streak: h.streak, doneToday: h.doneToday })),
  };
}

function partnerSnapshot(name: string, s: LifeOsSnapshot): PartnerSnapshot {
  const idle = s.spheres.map((x) => x.stats.idleDays).filter((v): v is number => v !== null);
  return {
    name,
    scoreWeek: s.week.map((d) => d.score),
    idleDays: idle.length === 0 ? null : Math.min(...idle),
    goalsBehind: s.goals.filter((g) => g.pace === "behind" && g.progress < 100).map((g) => g.title),
    brokenStreaks: s.habits
      .filter((h) => h.todayValue < h.target && h.last14.slice(9, 13).every((v) => v !== null && v >= h.target))
      .map((h) => h.label),
  };
}

export async function getPactView(me: User, conversationId: number): Promise<PactView | null> {
  const pact = await db.query.pacts.findFirst({ where: eq(pacts.conversationId, conversationId) });
  if (!pact || pact.status !== "active") return null;
  if (pact.initiatorId !== me.id && pact.partnerId !== me.id) return null;
  const partnerId = pact.initiatorId === me.id ? pact.partnerId : pact.initiatorId;
  const partner = await db.query.users.findFirst({ where: eq(users.id, partnerId) });
  if (!partner) return null;

  const [mine, theirs, last] = await Promise.all([
    loadLifeOs(me, { seed: false }),
    loadLifeOs(partner, { seed: false }),
    db
      .select({ senderId: chatMessages.senderId, at: max(chatMessages.createdAt) })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          inArray(chatMessages.kind, ["text", "checkin"]),
        ),
      )
      .groupBy(chatMessages.senderId),
  ]);
  const at = (userId: number) => last.find((l) => l.senderId === userId)?.at ?? null;

  return {
    pactId: pact.id,
    partner: card(partner, theirs),
    me: card(me, mine),
    signals: pactSignals(partnerSnapshot(partner.name ?? "Ton partenaire", theirs), {
      lastFromMe: at(me.id),
      lastFromPartner: at(partnerId),
    }),
  };
}

/** Les pactes actifs de ce membre, avec leurs deux participants. */
export async function activePactsOf(userId: number) {
  return db.query.pacts.findMany({
    where: and(eq(pacts.status, "active"), or(eq(pacts.initiatorId, userId), eq(pacts.partnerId, userId))),
    orderBy: [desc(pacts.acceptedAt)],
    with: {
      initiator: { columns: { id: true, name: true, avatarUrl: true } },
      partner: { columns: { id: true, name: true, avatarUrl: true } },
    },
  });
}
