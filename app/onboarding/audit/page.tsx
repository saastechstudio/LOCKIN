import { getOrCreateDbUser } from "@/lib/auth";
import { AuditFlow } from "@/components/onboarding/audit-flow";

export default async function AuditOnboardingPage() {
  await getOrCreateDbUser();

  return (
    <div className="mx-auto min-h-svh max-w-3xl px-6 py-16">
      <AuditFlow />
    </div>
  );
}
