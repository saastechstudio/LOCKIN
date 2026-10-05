import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

function readSignUpMetadata(metadata: Record<string, unknown> | undefined) {
  const text = (key: string) => {
    const value = metadata?.[key];
    return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : undefined;
  };
  return { firstName: text("firstName"), lastName: text("lastName"), country: text("country") };
}

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
  // Le formulaire d'inscription Lockin envoie prénom, nom et pays dans
  // unsafeMetadata (accepté quelle que soit la config de l'instance Clerk).
  const signUpData = readSignUpMetadata(clerkUser?.unsafeMetadata);
  const name =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    [signUpData.firstName, signUpData.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    "Membre Lock In";

  const [created] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email,
      name,
      country: signUpData.country,
      avatarUrl: clerkUser?.imageUrl,
    })
    // Sans cible : couvre clerk_id ET email. Deux requêtes parallèles du même
    // nouveau membre (la coque charge plusieurs composants serveur) entrent
    // en conflit sur les deux contraintes ; avec la seule cible clerk_id,
    // Postgres levait la violation « users_email_unique » et la page échouait.
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Race with another request creating the row concurrently.
  const fallback = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!fallback) throw new Error("Failed to resolve user record");
  return fallback;
}

/**
 * Porte d'entrée du Lockin Social Club — être "inscrit au club", c'est avoir
 * fait le rituel d'inscription (motivation + objectif + sport + routine).
 * Sinon : renvoi vers /rejoindre, avec `next` pour revenir ensuite là où le
 * membre allait (une réservation de camp, par exemple).
 */
export async function requireLockinOnboarded(next?: string): Promise<User> {
  const user = await getOrCreateDbUser();
  if (!user.lockinOnboardingCompletedAt) {
    redirect(next ? `/rejoindre?next=${encodeURIComponent(next)}` : "/rejoindre");
  }
  return user;
}

/** Dashboard de modération — réservé aux comptes avec users.isAdmin = true. */
export async function requireAdmin(): Promise<User> {
  const user = await getOrCreateDbUser();
  if (!user.isAdmin) {
    redirect("/dashboard/feed");
  }
  return user;
}

export async function getDbUserOrNull(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return existing ?? null;
}
