"use server";

import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { action, UserFacingError } from "@/lib/action-result";
import { getOrCreateDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { enforceRateLimit } from "@/lib/rate-limit";

/** Le navigateur réduit déjà la photo (512 px, JPEG) : 1 Mo laisse une large marge. */
const MAX_BYTES = 1_000_000;

/** Type réel du fichier d'après ses premiers octets : le type MIME déclaré par le client ne prouve rien. */
function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  return riff === "RIFF" && webp === "WEBP" ? "image/webp" : null;
}

function revalidateProfile(userId: number) {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profil");
  revalidatePath(`/dashboard/u/${userId}`);
}

/**
 * Photo de profil : stockée par Clerk (CDN inclus), l'URL publique est
 * recopiée dans users.avatar_url, que le feed, les messages et l'annuaire
 * lisent déjà. Aucun stockage de fichiers à gérer côté Lockin.
 */
export const updateAvatar = action(async (formData: FormData): Promise<{ avatarUrl: string }> => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("avatar", user.id);

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new UserFacingError("Choisis une image.");
  }
  if (file.size > MAX_BYTES) throw new UserFacingError("Image trop lourde (1 Mo maximum).");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) throw new UserFacingError("Format non pris en charge : JPEG, PNG ou WebP.");

  const clerk = await clerkClient();
  const updated = await clerk.users.updateUserProfileImage(user.clerkId, {
    file: new Blob([bytes], { type }),
  });

  await db.update(users).set({ avatarUrl: updated.imageUrl }).where(eq(users.id, user.id));
  revalidateProfile(user.id);
  return { avatarUrl: updated.imageUrl };
});

/** Retire la photo : Clerk redonne son image par défaut, les initiales s'affichent à la place. */
export const removeAvatar = action(async (): Promise<void> => {
  const user = await getOrCreateDbUser();
  enforceRateLimit("avatar", user.id);

  const clerk = await clerkClient();
  await clerk.users.deleteUserProfileImage(user.clerkId);
  await db.update(users).set({ avatarUrl: null }).where(eq(users.id, user.id));
  revalidateProfile(user.id);
});
