import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getFormationView } from "@/lib/formations-queries";
import { Eyebrow, PageHeader } from "@/components/lockin/primitives";
import { FormationBuilder } from "@/components/formations/formation-builder";
import { FormationForm } from "@/components/formations/formation-form";
import { PublishControls } from "@/components/formations/publish-controls";
import type { FormationLevel } from "@/lib/formations-data";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formationId = Number(id);
  if (!Number.isInteger(formationId)) notFound();
  const user = await requireLockinOnboarded(`/formations/${formationId}/builder`);

  const formation = await getFormationView(formationId, user.id);
  if (!formation) notFound();
  if (!formation.viewer.isCreator) redirect(`/formations/${formationId}`);

  const published = formation.status === "published";

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link href="/formations" className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-black/60 hover:text-lk-black">
        <ArrowLeft className="size-3.5" /> Formations
      </Link>

      <PageHeader
        eyebrow={published ? "Éditeur · publiée" : "Éditeur · brouillon"}
        title={formation.title}
        description="Structure ta formation : des modules, des chapitres, des ressources. Glisse la poignée ou utilise les flèches pour réordonner."
        actions={
          <>
            <Link href={`/formations/${formation.id}`} className="lockin-button lockin-button--outline">
              Voir la page
            </Link>
            <Link href={`/formations/${formation.id}/mentor`} className="lockin-button lockin-button--outline">
              Mentor
            </Link>
            <Link href={`/formations/${formation.id}/analytics`} className="lockin-button lockin-button--outline">
              Analytics
            </Link>
          </>
        }
      />

      <section className="lockin-section">
        <Eyebrow>Publication</Eyebrow>
        <p className="mt-3 mb-4 text-sm text-lk-black/70">
          {published
            ? "Visible de tous les membres du club."
            : "Brouillon : visible de toi seul. Publier exige au moins un chapitre."}
        </p>
        <PublishControls formationId={formation.id} published={published} />
      </section>

      <details className="lockin-section group">
        <summary className="cursor-pointer list-none text-[11px] font-semibold tracking-[0.2em] text-lk-black/60 uppercase marker:hidden">
          Informations de la formation
        </summary>
        <div className="mt-6">
          <FormationForm
            formationId={formation.id}
            initial={{
              title: formation.title,
              description: formation.description,
              theme: formation.theme,
              level: formation.level as FormationLevel,
              durationHours: formation.durationHours,
              priceEuros: formation.priceCents ? String(formation.priceCents / 100) : "",
            }}
          />
        </div>
      </details>

      <section>
        <Eyebrow>Contenu</Eyebrow>
        <div className="mt-4">
          <FormationBuilder formationId={formation.id} modules={formation.modules} />
        </div>
      </section>
    </div>
  );
}
