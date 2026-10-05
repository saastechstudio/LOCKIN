import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/lockin/primitives";
import { LockinSection } from "@/components/lockin/lockin-ui";
import { FormationForm } from "@/components/formations/formation-form";

export const dynamic = "force-dynamic";

export default async function CreateFormationPage() {
  await requireLockinOnboarded("/formations/create");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link href="/formations" className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-black/60 hover:text-lk-black">
        <ArrowLeft className="size-3.5" /> Formations
      </Link>
      <PageHeader
        eyebrow="Nouvelle formation"
        title="Pose les fondations."
        description="Tu crées d'abord le squelette : titre, thème, niveau. Les modules, chapitres et ressources s'ajoutent ensuite dans l'éditeur. Rien n'est visible des autres membres tant que tu n'as pas publié."
      />
      <LockinSection>
        <FormationForm />
      </LockinSection>
    </div>
  );
}
