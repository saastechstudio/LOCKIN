import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getFormationView } from "@/lib/formations-queries";
import { FORMATION_LEVEL_LABELS, formatPrice, type FormationLevel } from "@/lib/formations-data";
import { Eyebrow, Slogan, Stat } from "@/components/lockin/primitives";
import { ReportButton } from "@/components/moderation/report-button";
import { EnrollButton } from "@/components/formations/enroll-button";
import { ModuleCard } from "@/components/formations/module-card";
import { ProgressBarRect } from "@/components/formations/progress-bar-rect";

export const dynamic = "force-dynamic";

export default async function FormationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formationId = Number(id);
  if (!Number.isInteger(formationId)) notFound();
  const user = await requireLockinOnboarded(`/formations/${formationId}`);

  const formation = await getFormationView(formationId, user.id);
  if (!formation) notFound();

  const { viewer } = formation;
  const isPaid = Boolean(formation.priceCents && formation.priceCents > 0);
  const finished = viewer.enrolled && formation.chapterCount > 0 && viewer.doneCount >= formation.chapterCount;
  const linkButton = "lockin-button";

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Link href="/formations" className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-black/60 hover:text-lk-black">
        <ArrowLeft className="size-3.5" /> Formations
      </Link>

      {formation.status !== "published" ? (
        <p className="border border-lk-black bg-lk-mist p-4 text-sm">
          Brouillon : cette formation n&apos;est visible que de toi. Publie-la depuis l&apos;éditeur.
        </p>
      ) : null}

      <header className="border-b border-lk-black pb-8">
        <Eyebrow>
          {formation.theme} · {FORMATION_LEVEL_LABELS[formation.level as FormationLevel] ?? formation.level} · {formation.durationHours} h
        </Eyebrow>
        <h1 className="lockin-title mt-4">{formation.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed whitespace-pre-wrap text-lk-black/70">{formation.description}</p>
        <p className="mt-5 text-sm text-lk-black/60">
          Par{" "}
          <Link href={`/dashboard/u/${formation.creator.id}`} className="font-medium text-lk-black underline underline-offset-4">
            {formation.creator.name ?? "Membre Lockin"}
          </Link>
          {formation.creatorVerified ? (
            <span className="ml-3 border border-lk-black px-2 py-0.5 text-[10px] font-semibold tracking-[0.15em] uppercase">
              Créateur vérifié
            </span>
          ) : null}
        </p>
      </header>

      <section className="grid gap-8 sm:grid-cols-4">
        <Stat label="Prix" value={formatPrice(formation.priceCents)} />
        <Stat label="Modules" value={formation.modules.length} />
        <Stat label="Chapitres" value={formation.chapterCount} />
        <Stat label="Apprenants" value={formation.learnerCount} />
      </section>

      <section className="lockin-section space-y-5">
        {viewer.isCreator ? (
          <>
            <p className="text-sm text-lk-black/70">Tu es le créateur de cette formation.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/formations/${formation.id}/builder`} className={linkButton}>
                Modifier dans l&apos;éditeur
              </Link>
              <Link href={`/formations/${formation.id}/mentor`} className="lockin-button lockin-button--outline">
                Questions des apprenants
              </Link>
              <Link href={`/formations/${formation.id}/analytics`} className="lockin-button lockin-button--outline">
                Analytics
              </Link>
            </div>
          </>
        ) : viewer.enrolled ? (
          <>
            <ProgressBarRect done={viewer.doneCount} total={formation.chapterCount} />
            {finished ? (
              <div className="space-y-4 border-t border-lk-black pt-5">
                <p className="font-display text-xl">Formation terminée.</p>
                <Slogan as="p" size="md" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {viewer.nextChapterId ? (
                  <a href={`#chapitre-${viewer.nextChapterId}`} className={linkButton}>
                    {viewer.doneCount === 0 ? "Commencer" : "Continuer"}
                  </a>
                ) : null}
                <Link href={`/formations/${formation.id}/mentor`} className="lockin-button lockin-button--outline">
                  Poser une question au mentor
                </Link>
              </div>
            )}
          </>
        ) : isPaid ? (
          <p className="text-sm leading-relaxed text-lk-black/70">
            Cette formation est payante ({formatPrice(formation.priceCents)}). Le paiement n&apos;est pas encore activé sur
            Lockin : elle n&apos;est pas ouverte aux inscriptions pour l&apos;instant.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-lk-black/70">Gratuite. En commençant, tu accèdes aux ressources et tu suis ta progression.</p>
            <EnrollButton formationId={formation.id} />
          </div>
        )}
      </section>

      <section className="space-y-6" aria-label="Contenu de la formation">
        {formation.modules.length === 0 ? (
          <p className="border border-dashed border-lk-black p-8 text-center text-sm text-lk-black/60">
            Cette formation n&apos;a pas encore de contenu.
          </p>
        ) : (
          formation.modules.map((module, i) => (
            <ModuleCard key={module.id} module={module} index={i} canTrack={viewer.enrolled} nextChapterId={viewer.nextChapterId} />
          ))
        )}
      </section>

      {!viewer.isCreator ? (
        <div className="flex justify-end">
          <ReportButton targetType="formation" targetId={formation.id} />
        </div>
      ) : null}
    </div>
  );
}
