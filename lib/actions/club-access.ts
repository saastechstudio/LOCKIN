"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { campRegistrations, users } from "@/lib/db/schema";
import { action, UserFacingError } from "@/lib/action-result";
import { getOrCreateDbUser, requireAdmin } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { freeYearEnd } from "@/lib/club/access";
import { generateMemberNumber, normalizeMemberNumber } from "@/lib/club/member-number";

/** Violation de contrainte unique Postgres (23505), que l'erreur soit directe ou enveloppée par Drizzle. */
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

const UNKNOWN_NUMBER = "Ce numéro de membre n'est pas reconnu. Vérifie-le dans l'email de confirmation de ta place.";

function formatDay(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Entrée dans le club avec le numéro de membre reçu à la confirmation de la
 * place au Lockin Trip. Le club s'ouvre au début du séjour : avant, le
 * numéro est refusé. Un numéro n'ouvre qu'un seul compte. L'entrée ouvre un
 * an offert ; au-delà, 49 € TTC par an.
 */
export const activateClubMembership = action(async (input: string) => {
  const user = await getOrCreateDbUser();
  if (user.clubActivatedAt) return { alreadyMember: true as const };

  enforceRateLimit("clubNumber", user.id);
  const number = normalizeMemberNumber(String(input ?? ""));
  if (!number) throw new UserFacingError(UNKNOWN_NUMBER);

  const registration = await db.query.campRegistrations.findFirst({
    where: eq(campRegistrations.memberNumber, number),
    with: { session: { columns: { name: true, startDate: true } } },
  });
  // Même message pour « inconnu » et « pas confirmé » : on ne révèle rien sur les numéros.
  if (!registration || registration.status !== "confirmed") throw new UserFacingError(UNKNOWN_NUMBER);

  const { startDate, name } = registration.session;
  if (startDate.getTime() > Date.now()) {
    throw new UserFacingError(`Le club s'ouvre au début de ton séjour (${name}), le ${formatDay(startDate)}. Reviens à cette date avec ton numéro.`);
  }

  const now = new Date();
  try {
    const [claimed] = await db
      .update(users)
      .set({ clubRegistrationId: registration.id, clubActivatedAt: now, clubFreeUntil: freeYearEnd(now) })
      .where(and(eq(users.id, user.id), isNull(users.clubActivatedAt)))
      .returning({ id: users.id });
    if (!claimed) return { alreadyMember: true as const };
  } catch (error) {
    if (isUniqueViolation(error)) throw new UserFacingError("Ce numéro de membre est déjà utilisé par un autre compte.");
    throw error;
  }

  revalidatePath("/rejoindre");
  return { alreadyMember: false as const };
});

/**
 * Confirme une place au Lockin Trip (paiement reçu) et lui attribue son
 * numéro de membre. Idempotent : une place déjà confirmée garde son numéro.
 * Réservé aux administrateurs, revérifié ici car une Server Action s'appelle directement.
 */
export const confirmTripRegistration = action(async (registrationId: number) => {
  await requireAdmin();
  const current = await db.query.campRegistrations.findFirst({ where: eq(campRegistrations.id, registrationId) });
  if (!current) throw new UserFacingError("Pré-inscription introuvable.");
  if (current.status === "confirmed" && current.memberNumber) return { memberNumber: current.memberNumber };

  // Collision de numéro quasi impossible (31^6) mais l'unicité la rattraperait : on retente.
  for (let attempt = 0; attempt < 5; attempt++) {
    const memberNumber = generateMemberNumber();
    try {
      await db
        .update(campRegistrations)
        .set({ status: "confirmed", memberNumber })
        .where(eq(campRegistrations.id, registrationId));
      revalidatePath("/dashboard/admin/trip");
      return { memberNumber };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new UserFacingError("Impossible de générer un numéro. Réessaie.");
});

/** Annule une pré-inscription. Le numéro déjà attribué reste lié à son éventuel compte : l'annulation n'enlève pas un accès déjà ouvert. */
export const cancelTripRegistration = action(async (registrationId: number) => {
  await requireAdmin();
  await db.update(campRegistrations).set({ status: "cancelled" }).where(eq(campRegistrations.id, registrationId));
  revalidatePath("/dashboard/admin/trip");
});
