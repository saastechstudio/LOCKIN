"use server";

import { revalidatePath } from "next/cache";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { campSessions, campRegistrations, type CampSportChoice } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import {
  CAMP_SESSIONS_SEED,
  CAMP_PRICE_PER_PERSON,
  CAMP_TOTAL_SPOTS_PER_SESSION,
  EXCURSIONS_TO_CHOOSE,
  EXCURSIONS,
  FUN_ACTIVITIES,
  SPORT_ACTIVITIES,
  sessionDurationDays,
} from "@/lib/camp/data";
import { enforceRateLimit } from "@/lib/rate-limit";

export type CampSessionWithAvailability = {
  id: number;
  slug: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  pricePerPerson: number;
  totalSpots: number;
  remainingSpots: number;
};

/**
 * Les deux sessions du camp sont un catalogue fixe (lib/camp/data.ts) mais
 * vivent en base pour qu'on puisse compter les places restantes. Premier
 * appel : les crée si absentes (idempotent via le slug unique) ; ensuite,
 * simple lecture. Pas de script de seed séparé à faire tourner en prod.
 */
export async function getCampSessions(): Promise<CampSessionWithAvailability[]> {
  for (const seed of CAMP_SESSIONS_SEED) {
    await db
      .insert(campSessions)
      .values({
        slug: seed.slug,
        name: seed.name,
        startDate: new Date(seed.startDate),
        endDate: new Date(seed.endDate),
        pricePerPerson: CAMP_PRICE_PER_PERSON.toString(),
        totalSpots: CAMP_TOTAL_SPOTS_PER_SESSION,
      })
      .onConflictDoNothing({ target: campSessions.slug });
  }

  const sessions = await db.query.campSessions.findMany({
    orderBy: (fields, { asc }) => [asc(fields.startDate)],
  });

  return Promise.all(sessions.map(withAvailability));
}

export async function getCampSession(
  slug: string,
): Promise<CampSessionWithAvailability | null> {
  const session = await db.query.campSessions.findFirst({
    where: eq(campSessions.slug, slug),
  });
  if (!session) return null;
  return withAvailability(session);
}

async function withAvailability(session: {
  id: number;
  slug: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  pricePerPerson: string;
  totalSpots: number;
}): Promise<CampSessionWithAvailability> {
  const [{ value }] = await db
    .select({ value: count() })
    .from(campRegistrations)
    .where(
      and(
        eq(campRegistrations.sessionId, session.id),
        // Une annulation libère la place ; en attente ou confirmé la retient.
        eq(campRegistrations.status, "pending"),
      ),
    );

  return {
    id: session.id,
    slug: session.slug,
    name: session.name,
    destination: session.destination,
    startDate: session.startDate,
    endDate: session.endDate,
    pricePerPerson: Number(session.pricePerPerson),
    totalSpots: session.totalSpots,
    remainingSpots: Math.max(0, session.totalSpots - value),
  };
}

const sportChoiceSchema = z.object({
  day: z.number().int().min(1).max(60),
  activityId: z
    .string()
    .refine((id) => SPORT_ACTIVITIES.some((s) => s.id === id), "Sport inconnu"),
});

const createRegistrationSchema = z.object({
  sessionId: z.number().int(),
  fullName: z.string().trim().min(2).max(140),
  sportChoices: z.array(sportChoiceSchema).max(60),
  excursionChoices: z
    .array(z.string())
    .length(EXCURSIONS_TO_CHOOSE)
    .refine(
      (ids) => ids.every((id) => EXCURSIONS.some((e) => e.id === id)),
      "Excursion inconnue",
    ),
  funActivityChoice: z
    .string()
    .refine((id) => FUN_ACTIVITIES.some((a) => a.id === id), "Activité fun inconnue"),
});

export type CreateCampRegistrationInput = {
  sessionId: number;
  fullName: string;
  sportChoices: CampSportChoice[];
  excursionChoices: string[];
  funActivityChoice: string;
};

/**
 * Enregistre une pré-inscription — réservée aux membres du club (compte +
 * rituel d'inscription fait), vérifié ici et pas seulement par la page :
 * une Server Action s'appelle directement. L'email est celui du compte,
 * jamais une saisie libre. Une par email et par session (contrainte
 * camp_registrations_session_email_idx) : re-soumettre met à jour la
 * réservation plutôt que d'échouer. Le paiement n'est pas branché ici : la
 * place est réservée au statut "pending" en attendant l'intégration
 * ultérieure (cf. getCampPaymentPlaceholder plus bas).
 */
export async function createCampRegistration(input: CreateCampRegistrationInput) {
  const user = await getOrCreateDbUser();
  if (!user.lockinOnboardingCompletedAt) {
    throw new Error("Les Lock-In Camp sont réservés aux membres du Lockin Social Club.");
  }
  enforceRateLimit("camp", user.id);
  const parsed = createRegistrationSchema.parse(input);

  const session = await db.query.campSessions.findFirst({
    where: eq(campSessions.id, parsed.sessionId),
  });
  if (!session) throw new Error("Session introuvable");

  // Un choix de sport par jour du séjour, pas plus, et chaque jour une seule fois.
  const days = sessionDurationDays(session.startDate, session.endDate);
  const seenDays = new Set<number>();
  for (const choice of parsed.sportChoices) {
    if (choice.day > days || seenDays.has(choice.day)) throw new Error("Choix de sports invalide.");
    seenDays.add(choice.day);
  }

  // Places limitées : une nouvelle réservation n'entre que s'il reste de la place.
  const alreadyBooked = await db.query.campRegistrations.findFirst({
    columns: { id: true },
    where: and(eq(campRegistrations.sessionId, session.id), eq(campRegistrations.email, user.email)),
  });
  if (!alreadyBooked) {
    const { remainingSpots } = await withAvailability(session);
    if (remainingSpots <= 0) throw new Error("Cette session est complète.");
  }

  const [registration] = await db
    .insert(campRegistrations)
    .values({
      userId: user.id,
      sessionId: parsed.sessionId,
      fullName: parsed.fullName,
      email: user.email,
      sportChoices: parsed.sportChoices,
      excursionChoices: parsed.excursionChoices,
      funActivityChoice: parsed.funActivityChoice,
    })
    .onConflictDoUpdate({
      target: [campRegistrations.sessionId, campRegistrations.email],
      set: {
        userId: user.id,
        fullName: parsed.fullName,
        sportChoices: parsed.sportChoices,
        excursionChoices: parsed.excursionChoices,
        funActivityChoice: parsed.funActivityChoice,
      },
    })
    .returning();

  revalidatePath("/camp");
  revalidatePath(`/camp/${session.slug}`);
  revalidatePath(`/camp/${session.slug}/reserver`);

  return registration;
}

/**
 * Placeholder pour le paiement : aucun fournisseur n'est encore branché sur
 * le camp (seul produit payant de Lock In, le club étant gratuit).
 * À remplacer par un vrai lien de checkout quand le moment sera venu ; la
 * pré-inscription reste valable (statut "pending") en attendant.
 */
export async function getCampPaymentPlaceholder(): Promise<string | null> {
  return null;
}
