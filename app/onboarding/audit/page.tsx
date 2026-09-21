import { redirect } from "next/navigation";

import { getOrCreateDbUser } from "@/lib/auth";
import { hasPremiumAccess, requiresSubscription } from "@/lib/premium";
import { AuditFlow } from "@/components/onboarding/audit-flow";

export default async function AuditOnboardingPage() {
  const user = await getOrCreateDbUser();

  if (requiresSubscription() && !hasPremiumAccess(user)) {
    redirect("/subscribe");
  }

  return (
    <div className="mx-auto min-h-svh max-w-3xl px-6 py-16">
      <AuditFlow />
    </div>
  );
}
