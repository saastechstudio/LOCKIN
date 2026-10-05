import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/auth";
import { getLockinOnboardingStatus } from "@/lib/actions/onboarding-lockin";
import { LockinOnboardingWizard } from "@/components/onboarding/lockin-onboarding-wizard";

export const dynamic = "force-dynamic";

/**
 * Rituel d'inscription au Lockin Social Club — hors de /dashboard exprès :
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

  const { completed } = await getLockinOnboardingStatus();
  if (completed) redirect(next);

  return <LockinOnboardingWizard next={next} />;
}
