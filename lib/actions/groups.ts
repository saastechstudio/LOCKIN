"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { groups, groupMembers } from "@/lib/db/schema";
import { getOrCreateDbUser, getDbUserOrNull } from "@/lib/auth";
import { GROUPS_SEED } from "@/lib/social/data";
import { assertClubMember } from "@/lib/moderation/enforce";

/**
 * Amorce les groupes depuis le catalogue fixe (idempotent via le slug
 * unique, même pattern que getCampSessions) puis lit tout, avec le nombre
 * de membres et si le visiteur courant (s'il est connecté) en fait partie.
 */
export async function getGroups() {
  for (const seed of GROUPS_SEED) {
    await db
      .insert(groups)
      .values({ slug: seed.slug, name: seed.name, type: seed.type, description: seed.description })
      .onConflictDoNothing({ target: groups.slug });
  }

  const viewer = await getDbUserOrNull();
  const rows = await db.query.groups.findMany({
    where: eq(groups.isPrivate, false),
    with: { members: { columns: { userId: true } } },
    orderBy: (fields, { asc }) => [asc(fields.type), asc(fields.name)],
  });

  return rows.map((g) => ({
    ...g,
    memberCount: g.members.length,
    isMember: viewer ? g.members.some((m) => m.userId === viewer.id) : false,
  }));
}

export async function getGroup(slug: string) {
  const viewer = await getDbUserOrNull();
  const group = await db.query.groups.findFirst({
    where: eq(groups.slug, slug),
    with: { members: { columns: { userId: true } } },
  });
  if (!group) return null;
  const isMember = viewer ? group.members.some((m) => m.userId === viewer.id) : false;
  // Un club privé n'existe pas pour qui n'en fait pas partie.
  if (group.isPrivate && !isMember) return null;

  return {
    ...group,
    memberCount: group.members.length,
    isMember: viewer ? group.members.some((m) => m.userId === viewer.id) : false,
  };
}

export async function joinGroup(groupId: number) {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  const group = await db.query.groups.findFirst({
    columns: { isPrivate: true },
    where: eq(groups.id, groupId),
  });
  // Les clubs privés se rejoignent sur invitation, jamais par leur identifiant.
  if (!group || group.isPrivate) throw new Error("Club introuvable.");
  await db
    .insert(groupMembers)
    .values({ groupId, userId: user.id })
    .onConflictDoNothing({ target: [groupMembers.groupId, groupMembers.userId] });

  revalidatePath("/dashboard/groupes");
}

export async function leaveGroup(groupId: number) {
  const user = await getOrCreateDbUser();
  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

  revalidatePath("/dashboard/groupes");
}
