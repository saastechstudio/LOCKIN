import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/safe-path";
import { getLockinOnboardingStatus } from "@/lib/actions/onboarding-lockin";
import { LockinOnboardingWizard } from "@/components/onboarding/lockin-onboarding-wizard";
import { MemberNumberForm } from "@/components/club/member-number-form";
import { LOCKIN_TRIP_HREF } from "@/lib/club/membership";

export const dynamic = "force-dynamic";

/**
 * Entrée au Lockin Social Club : numéro de membre du Lockin Trip, puis rituel
 * d'inscription — hors de /dashboard exprès :
 * entrer dans le club ne doit pas passer par l'audit coaching que le layout
 * du dashboard impose. `next` ramène le membre là où il allait (ex. une
 * réservation de camp) une fois le rituel fait.
 */
export default async function RejoindrePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next) ?? "/dashboard/feed";

  // Deux portes, dans l'ordre : le numéro de membre du Lockin Trip, puis le rituel.
  const { entered, completed } = await getLockinOnboardingStatus();
  if (!entered) return <MemberNumberForm lockinTripHref={LOCKIN_TRIP_HREF} />;
  if (completed) redirect(next);

  return <LockinOnboardingWizard next={next} />;
}
