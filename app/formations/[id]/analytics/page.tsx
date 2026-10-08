import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getAnalyticsView } from "@/lib/formations-queries";
import { Eyebrow, PageHeader, Stat } from "@/components/lockin/primitives";
import { VerticalBars } from "@/components/lockin/vertical-bars";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formationId = Number(id);
  if (!Number.isInteger(formationId)) notFound();
  const user = await requireLockinOnboarded(`/formations/${formationId}/analytics`);

  const view = await getAnalyticsView(formationId, user.id);
  if (!view) notFound();

  const { stats, chapters } = view;
  const maxLearners = Math.max(1, ...stats.distribution.map((d) => d.learners));

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <Link href={`/formations/${formationId}/builder`} className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-stone-3 hover:text-lk-black">
        <ArrowLeft className="size-3.5" /> Éditeur
      </Link>
      <PageHeader
        eyebrow="Analytics"
        title={view.formation.title}
        description="Ce qui se passe réellement chez tes apprenants : qui avance, où ça coince. Aucun chiffre de vanité."
      />

      <section className="grid gap-8 sm:grid-cols-4">
        <Stat label="Apprenants" value={stats.learnerCount} />
        <Stat label="Taux de complétion" value={`${stats.completionRate} %`} hint={`${stats.completedCount} ont terminé`} />
        <Stat label="Progression moyenne" value={`${stats.averageProgress} %`} />
        <Stat label="Questions en attente" value={view.pendingQuestions} hint={<Link href={`/formations/${formationId}/mentor`} className="underline underline-offset-4">Ouvrir le mentor</Link>} />
      </section>

      <section>
        <Eyebrow>Complétion par chapitre</Eyebrow>
        {chapters.length === 0 ? (
          <p className="mt-4 text-sm text-lk-stone-3">Aucun chapitre pour l&apos;instant.</p>
        ) : stats.learnerCount === 0 ? (
          <p className="mt-4 text-sm text-lk-stone-3">Aucun apprenant inscrit : rien à mesurer pour l&apos;instant.</p>
        ) : (
          <div className="mt-6">
            <VerticalBars
              height={200}
              bars={stats.perChapter.map((c, i) => ({
                key: String(c.chapterId),
                value: c.percent,
                label: String(i + 1),
                title: `${chapters[i].title} : ${c.percent} % (${c.done}/${stats.learnerCount})`,
              }))}
            />
            <ol className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {chapters.map((c, i) => (
                <li key={c.id} className="flex gap-3 border-t border-lk-line pt-2">
                  <span className="text-xs text-lk-gold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate">{c.title}</span>
                  <span className="text-xs text-lk-stone-3 tabular-nums">{stats.perChapter[i].percent} %</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section>
        <Eyebrow>Répartition des apprenants par progression</Eyebrow>
        <div className="mt-6">
          <VerticalBars
            height={160}
            bars={stats.distribution.map((d) => ({
              key: d.label,
              value: d.learners === 0 ? null : (d.learners / maxLearners) * 100,
              label: `${d.learners}`,
              title: `${d.label} : ${d.learners} apprenant${d.learners > 1 ? "s" : ""}`,
              accent: d.label === "100 %",
            }))}
          />
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-lk-stone-3">
            {stats.distribution.map((d) => (
              <li key={d.label} className="tabular-nums">
                {d.label} : {d.learners}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
