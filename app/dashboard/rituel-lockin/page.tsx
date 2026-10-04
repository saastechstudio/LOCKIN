import { redirect } from "next/navigation";

import { getLockinOnboardingStatus } from "@/lib/actions/onboarding-lockin";
import { LockinOnboardingWizard } from "@/components/onboarding/lockin-onboarding-wizard";

export const dynamic = "force-dynamic";

/** Rituel d'inscription du Lockin Social Club — étape obligatoire avant le feed. */
export default async function RituelLockinPage() {
  const { completed } = await getLockinOnboardingStatus();
  if (completed) redirect("/dashboard/feed");

  return <LockinOnboardingWizard />;
}
