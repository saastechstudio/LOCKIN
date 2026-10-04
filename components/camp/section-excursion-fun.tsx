import { SectionTitle } from "@/components/camp/section-title";
import { EXCURSIONS, FUN_ACTIVITIES } from "@/lib/camp/data";

/**
 * Deux listes côte à côte (excursion, activité fun) — une par séjour, choix
 * réel dans le parcours de réservation. Fond blanc, filets fins, pas de
 * puces, pas de carte.
 */
export function SectionExcursionFun() {
  return (
    <section id="excursion-fun" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="06"
          eyebrow="1 de chaque, incluse"
          title="Excursion & activité fun"
          className="mb-12"
        />

        <div className="grid grid-cols-1 border-2 border-camp-charcoal sm:grid-cols-2">
          <div className="border-b border-camp-hairline p-6 sm:border-r sm:border-b-0 sm:p-8">
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-camp-gold uppercase">
              Excursion — 1 incluse
            </p>
            <ul className="mt-5 space-y-0">
              {EXCURSIONS.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 border-t border-camp-hairline py-3 first:border-t-0"
                >
                  <span className="text-lg">{e.emoji}</span>
                  <span className="text-sm text-camp-charcoal/80">{e.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8">
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-camp-gold uppercase">
              Activité fun — 1 incluse
            </p>
            <ul className="mt-5 space-y-0">
              {FUN_ACTIVITIES.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border-t border-camp-hairline py-3 first:border-t-0"
                >
                  <span className="text-lg">{a.emoji}</span>
                  <span className="text-sm text-camp-charcoal/80">{a.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
