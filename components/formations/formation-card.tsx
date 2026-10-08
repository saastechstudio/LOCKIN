import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  FORMATION_LEVEL_LABELS,
  formatPrice,
  type FormationLevel,
} from "@/lib/formations-data";
import type { FormationSummary } from "@/lib/formations-queries";

/** Carte rectangulaire d'une formation : un bloc, un filet, aucune image. */
export function FormationCard({
  formation,
  mine = false,
  className,
}: {
  formation: FormationSummary;
  /** Dans « Mes formations » : statut visible, et le lien mène au builder. */
  mine?: boolean;
  className?: string;
}) {
  const href = mine ? `/formations/${formation.id}/builder` : `/formations/${formation.id}`;
  const level = FORMATION_LEVEL_LABELS[formation.level as FormationLevel] ?? formation.level;

  return (
    <Link
      href={href}
      className={cn(
        "flex h-full flex-col border-r border-b border-lk-line p-6 transition-colors hover:bg-lk-mist",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
        <span className="text-lk-stone-3">{formation.theme}</span>
        {mine ? (
          <span className={cn("border px-2 py-0.5", formation.status === "published" ? "border-lk-line bg-lk-black text-lk-white" : "border-lk-line text-lk-stone-3")}>
            {formation.status === "published" ? "Publiée" : "Brouillon"}
          </span>
        ) : (
          <span className="text-lk-gold">{formatPrice(formation.priceCents)}</span>
        )}
      </div>

      <h3 className="font-display mt-4 text-xl leading-tight text-lk-black">{formation.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-lk-stone-3">{formation.description}</p>

      <dl className="mt-6 grid grid-cols-[1fr_1fr_1.6fr] gap-2 border-t border-lk-line pt-3 text-xs">
        <div>
          <dt className="text-lk-stone-3">Niveau</dt>
          <dd className="mt-1 font-medium">{level}</dd>
        </div>
        <div>
          <dt className="text-lk-stone-3">Durée</dt>
          <dd className="mt-1 font-medium tabular-nums">{formation.durationHours} h</dd>
        </div>
        <div>
          <dt className="text-lk-stone-3">Contenu</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {formation.moduleCount} mod. · {formation.chapterCount} chap.
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-lk-stone-3">
        {formation.creator.name ?? "Membre Lockin"} · {formation.learnerCount} apprenant
        {formation.learnerCount > 1 ? "s" : ""}
        {mine ? ` · ${formatPrice(formation.priceCents)}` : ""}
      </p>
    </Link>
  );
}
