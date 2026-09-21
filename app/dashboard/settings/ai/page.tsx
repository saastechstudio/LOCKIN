import { getOrCreateDbUser } from "@/lib/auth";
import { AiCoachConfigurator } from "@/components/dashboard/ai-coach-configurator";

export default async function AiCoachSettingsPage() {
  const user = await getOrCreateDbUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">
          Configure ton Coach IA
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personnalise l&apos;apparence, le ton et le nom de ton mentor
          d&apos;excellence.
        </p>
      </div>

      <AiCoachConfigurator user={user} />
    </div>
  );
}
