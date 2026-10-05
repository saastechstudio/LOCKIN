"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { challengeCheckins, challengeParticipants, challenges } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { CHALLENGES_SEED, challengeDayIndex, startOfDay } from "@/lib/challenges-data";
import { assertClubMember } from "@/lib/moderation/enforce";

async function seedChallenges() {
  for (const seed of CHALLENGES_SEED) {
    await db.insert(challenges).values(seed).onConflictDoNothing({ target: challenges.slug });
  }
}

type ParticipantRow = {
  id: number;
  userId: number;
  startedOn: Date;
  checkins: { day: Date }[];
};

function participationState(p: ParticipantRow, durationDays: number) {
  const today = startOfDay();
  const dayIndex = challengeDayIndex(p.startedOn, today);
  const done = p.checkins.length;
  return {
    participantId: p.id,
    dayIndex: Math.min(dayIndex, durationDays),
    done,
    checkedToday: p.checkins.some((c) => startOfDay(c.day).getTime() === today.getTime()),
    finished: dayIndex > durationDays,
    completed: done >= durationDays,
  };
}

export async function getChallenges() {
  await seedChallenges();
  const me = await getOrCreateDbUser();

  const rows = await db.query.challenges.findMany({
    with: {
      participants: {
        columns: { id: true, userId: true, startedOn: true },
        with: { checkins: { columns: { day: true } } },
      },
    },
    orderBy: (fields, { asc }) => [asc(fields.durationDays), asc(fields.id)],
  });

  return rows.map((c) => {
    const mine = c.participants.find((p) => p.userId === me.id);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      durationDays: c.durationDays,
      participantCount: c.participants.length,
      mine: mine ? participationState(mine, c.durationDays) : null,
    };
  });
}

export async function getChallenge(slug: string) {
  await seedChallenges();
  const me = await getOrCreateDbUser();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.slug, slug),
    with: {
      participants: {
        columns: { id: true, userId: true, startedOn: true },
        with: {
          checkins: { columns: { day: true } },
          user: { columns: { id: true, name: true, lockinLevel: true } },
        },
      },
    },
  });
  if (!challenge) return null;

  // Classement : jours validés, puis l'ancienneté de l'engagement à égalité.
  const leaderboard = challenge.participants
    .map((p) => ({
      user: p.user,
      done: p.checkins.length,
      startedOn: p.startedOn,
      isMe: p.userId === me.id,
    }))
    .sort((a, b) => b.done - a.done || a.startedOn.getTime() - b.startedOn.getTime());

  const mine = challenge.participants.find((p) => p.userId === me.id);

  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    description: challenge.description,
    durationDays: challenge.durationDays,
    leaderboard,
    mine: mine
      ? {
          ...participationState(mine, challenge.durationDays),
          days: Array.from({ length: challenge.durationDays }, (_, i) => {
            const day = new Date(startOfDay(mine.startedOn));
            day.setDate(day.getDate() + i);
            return mine.checkins.some((c) => startOfDay(c.day).getTime() === day.getTime());
          }),
        }
      : null,
  };
}

/** Rejoindre = jour 1 aujourd'hui. Rejoindre à nouveau un challenge fini le relance de zéro. */
export async function joinChallenge(challengeId: number) {
  const me = await getOrCreateDbUser();
  assertClubMember(me);
  const challenge = await db.query.challenges.findFirst({ where: eq(challenges.id, challengeId) });
  if (!challenge) throw new Error("Challenge introuvable.");

  const existing = await db.query.challengeParticipants.findFirst({
    where: and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, me.id)),
  });
  if (existing) {
    if (challengeDayIndex(existing.startedOn) <= challenge.durationDays) return;
    await db.delete(challengeParticipants).where(eq(challengeParticipants.id, existing.id));
  }

  await db
    .insert(challengeParticipants)
    .values({ challengeId, userId: me.id, startedOn: startOfDay() })
    .onConflictDoNothing();

  revalidatePath("/dashboard/challenges");
  revalidatePath(`/dashboard/challenges/${challenge.slug}`);
}

export async function leaveChallenge(challengeId: number) {
  const me = await getOrCreateDbUser();
  await db
    .delete(challengeParticipants)
    .where(and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, me.id)));
  revalidatePath("/dashboard/challenges");
}

/** Valider sa journée : une seule fois par jour, et seulement pendant la durée du challenge. */
export async function checkInChallenge(challengeId: number) {
  const me = await getOrCreateDbUser();
  assertClubMember(me);
  const participant = await db.query.challengeParticipants.findFirst({
    where: and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, me.id)),
    with: { challenge: { columns: { slug: true, durationDays: true } } },
  });
  if (!participant) throw new Error("Rejoins d'abord ce challenge.");
  if (challengeDayIndex(participant.startedOn) > participant.challenge.durationDays) {
    throw new Error("Ce challenge est terminé.");
  }

  await db
    .insert(challengeCheckins)
    .values({ participantId: participant.id, day: startOfDay() })
    .onConflictDoNothing();

  revalidatePath("/dashboard/challenges");
  revalidatePath(`/dashboard/challenges/${participant.challenge.slug}`);
  revalidatePath("/dashboard/progression");
}
