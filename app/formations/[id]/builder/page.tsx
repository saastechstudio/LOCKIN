import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getFormationView } from "@/lib/formations-queries";
import { getCreatorVerification } from "@/lib/creator-verification";
import { CREATOR_STATUS_LABELS } from "@/lib/formations-data";
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
  const verification = await getCreatorVerification(user.id);
  const verified = verification.status === "approved";

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
            : "Brouillon : visible de toi seul. Publier exige au moins un chapitre et une identité validée."}
        </p>
        {!verified ? (
          <div className="mb-4 space-y-2 border border-lk-black bg-lk-mist p-4 text-sm">
            <p className="font-medium">{CREATOR_STATUS_LABELS[verification.status]}</p>
            <p className="text-lk-black/70">
              {verification.status === "pending"
                ? "Un administrateur examine ta demande. Tu pourras publier dès qu'elle sera approuvée."
                : "Pour publier, fais valider ton identité de créateur."}
            </p>
            {verification.status !== "pending" ? (
              <Link href="/formations/verification" className="lockin-button lockin-button--outline">
                {verification.status === "rejected" ? "Corriger ma demande" : "Demander la vérification"}
              </Link>
            ) : null}
          </div>
        ) : null}
        <PublishControls formationId={formation.id} published={published} canPublish={verified} />
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
