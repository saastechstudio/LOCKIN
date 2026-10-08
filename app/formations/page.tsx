import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { listMyFormations, listPublishedFormations } from "@/lib/formations-queries";
import { getCreatorVerification } from "@/lib/creator-verification";
import { CREATOR_STATUS_LABELS } from "@/lib/formations-data";
import { FORMATION_THEMES } from "@/lib/formations-data";
import { cn } from "@/lib/utils";
import { Eyebrow, PageHeader, Slogan } from "@/components/lockin/primitives";
import { FormationCard } from "@/components/formations/formation-card";

export const dynamic = "force-dynamic";

function pageHref(theme: string | null, page: number) {
  const params = new URLSearchParams();
  if (theme) params.set("theme", theme);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/formations?${query}` : "/formations";
}

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; page?: string }>;
}) {
  const user = await requireLockinOnboarded("/formations");
  const sp = await searchParams;
  const [catalog, mine, verification] = await Promise.all([
    listPublishedFormations({ theme: sp.theme, page: Number(sp.page) }),
    listMyFormations(user.id),
    getCreatorVerification(user.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      <PageHeader
        eyebrow="Formations"
        title="Transmets ce que tu as gagné au combat."
        description="Des formations créées par des membres, structurées en modules et chapitres. Tu avances chapitre par chapitre, tu poses tes questions au mentor, sans likes ni course aux vues."
        actions={
          <Link href="/formations/create" className="lockin-button">
            Créer une formation
          </Link>
        }
      />

      {verification.status !== "approved" ? (
        <aside className="flex flex-col gap-3 border border-lk-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-lk-black/70">
            <span className="font-medium text-lk-black">{CREATOR_STATUS_LABELS[verification.status]}.</span> Pour publier une
            formation, ton identité de créateur doit être validée.
          </p>
          <Link href="/formations/verification" className="lockin-button lockin-button--outline shrink-0">
            {verification.status === "pending" ? "Voir ma demande" : "Demander la vérification"}
          </Link>
        </aside>
      ) : null}

      {mine.length > 0 ? (
        <section>
          <Eyebrow>Mes formations</Eyebrow>
          <div className="mt-4 grid border-t border-l border-lk-line sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((f) => (
              <FormationCard key={f.id} formation={f} mine />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <Eyebrow>Catalogue</Eyebrow>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filtrer par thème">
          {[null, ...FORMATION_THEMES].map((t) => (
            <Link
              key={t ?? "tous"}
              href={pageHref(t, 1)}
              className={cn(
                "border px-3 py-1.5 text-xs font-medium",
                catalog.theme === t ? "border-lk-line bg-lk-black text-lk-white" : "border-lk-line hover:border-lk-line",
              )}
            >
              {t ?? "Tous"}
            </Link>
          ))}
        </nav>

        {catalog.items.length === 0 ? (
          <p className="mt-8 border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">
            Aucune formation publiée{catalog.theme ? ` en ${catalog.theme}` : ""} pour l&apos;instant. Sois le premier à transmettre.
          </p>
        ) : (
          <div className="mt-6 grid border-t border-l border-lk-line sm:grid-cols-2 lg:grid-cols-3">
            {catalog.items.map((f) => (
              <FormationCard key={f.id} formation={f} />
            ))}
          </div>
        )}

        {catalog.pageCount > 1 ? (
          <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
            {catalog.page > 1 ? (
              <Link href={pageHref(catalog.theme, catalog.page - 1)} className="lockin-button lockin-button--outline">
                Page précédente
              </Link>
            ) : (
              <span />
            )}
            <span className="text-lk-stone-3 tabular-nums">
              Page {catalog.page} / {catalog.pageCount}
            </span>
            {catalog.page < catalog.pageCount ? (
              <Link href={pageHref(catalog.theme, catalog.page + 1)} className="lockin-button lockin-button--outline">
                Page suivante
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>

      <section className="bg-lk-black px-6 py-12 text-lk-white sm:px-10">
        <Slogan as="p" size="lg" className="text-lk-white" />
      </section>
    </div>
  );
}
