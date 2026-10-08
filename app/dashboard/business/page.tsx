import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { requireLockinOnboarded } from "@/lib/auth";
import { getBusinessOffers } from "@/lib/actions/business";
import { BUSINESS_KINDS, BUSINESS_KIND_LABELS, type BusinessKind } from "@/lib/business-data";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/lockin/primitives";
import { ReportButton } from "@/components/moderation/report-button";
import { OfferComposer } from "@/components/business/offer-composer";
import { DeleteOfferButton } from "@/components/business/delete-offer-button";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireLockinOnboarded("/dashboard/business");
  const { type } = await searchParams;
  const kind = BUSINESS_KINDS.find((k) => k === type);
  const offers = await getBusinessOffers(kind);

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <PageHeader
        eyebrow="Mode Business"
        title="Construire, entre membres."
        description="Offres, recherches, partenariats. On s'adresse à des gens qui tiennent leurs engagements."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par type">
        {[undefined, ...BUSINESS_KINDS].map((k) => (
          <Link
            key={k ?? "toutes"}
            href={k ? `/dashboard/business?type=${k}` : "/dashboard/business"}
            className={cn(
              "border px-3 py-1.5 text-xs font-medium",
              kind === k ? "border-lk-line bg-lk-black text-lk-white" : "border-lk-line hover:border-lk-line",
            )}
          >
            {k ? BUSINESS_KIND_LABELS[k] : "Toutes"}
          </Link>
        ))}
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {offers.length === 0 ? (
            <p className="text-sm text-lk-stone-3">Aucune annonce pour l&apos;instant.</p>
          ) : (
            <ul className="border-t border-lk-line">
              {offers.map((o) => (
                <li key={o.id} className="border-b border-lk-line py-5">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-gold uppercase">
                    {BUSINESS_KIND_LABELS[o.kind as BusinessKind] ?? o.kind}
                    {o.location ? <span className="text-lk-black/40"> · {o.location}</span> : null}
                  </p>
                  <p className="font-display mt-2 text-lg">{o.title}</p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-lk-black/80">{o.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                    <Link href={`/dashboard/u/${o.user.id}`} className="mr-auto text-lk-stone-3 hover:underline">
                      {o.user.name ?? "Membre Lockin"}
                      {o.user.sector ? ` · ${o.user.sector}` : ""} ·{" "}
                      {formatDistanceToNow(o.createdAt, { addSuffix: true, locale: fr })}
                    </Link>
                    {o.isMine ? (
                      <DeleteOfferButton offerId={o.id} />
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/messages/${o.user.id}`}
                          className="border border-lk-line px-3 py-1.5 font-medium hover:bg-lk-black hover:text-lk-white"
                        >
                          Répondre en privé
                        </Link>
                        <ReportButton targetType="business_offer" targetId={o.id} />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside>
          <OfferComposer />
        </aside>
      </div>
    </div>
  );
}
