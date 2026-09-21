import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

/**
 * Ensures a `users` row exists for the signed-in Clerk user and returns it.
 * Clerk owns identity; this table mirrors just what the app needs (billing,
 * OKRs, check-ins) keyed off clerkId.
 */
export async function getOrCreateDbUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    "Membre Lock In";

  const [created] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email,
      name,
      avatarUrl: clerkUser?.imageUrl,
    })
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  if (created) return created;

  // Race with another request creating the row concurrently.
  const fallback = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!fallback) throw new Error("Failed to resolve user record");
  return fallback;
}

export async function getDbUserOrNull(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return existing ?? null;
}
