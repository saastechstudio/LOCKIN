import type { User } from "@/lib/db/schema";

/**
 * Le club est réservé aux personnes du Lockin Trip, entrées avec leur
 * numéro de membre (`clubActivatedAt`), puis passées par le rituel. Les
 * administrateurs n'ont pas besoin de numéro : ils modèrent le club.
 */
export function hasClubEntry(user: Pick<User, "clubActivatedAt" | "isAdmin">): boolean {
  return Boolean(user.clubActivatedAt) || user.isAdmin;
}

export function isClubMember(
  user: Pick<User, "clubActivatedAt" | "isAdmin" | "lockinOnboardingCompletedAt">,
): boolean {
  return hasClubEntry(user) && Boolean(user.lockinOnboardingCompletedAt);
}

/** Un an offert à compter de l'entrée dans le club. */
export function freeYearEnd(from: Date): Date {
  const end = new Date(from);
  end.setFullYear(end.getFullYear() + 1);
  return end;
}
