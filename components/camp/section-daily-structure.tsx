import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_DAILY_BLOCKS } from "@/lib/camp/data";

/**
 * Détail chronométré de la session Lock-In du matin (10h–12h). Fond blanc,
 * quatre blocs en ligne, la durée affichée comme un repère chiffré plutôt
 * qu'une icône d'horloge.
 */
export function SectionDailyStructure() {
  return (
    <section id="structure-quotidienne" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="04"
          eyebrow="La session du matin · 10h–12h"
          title="Structure quotidienne — 2h"
          className="mb-12"
        />

        <div className="grid grid-cols-1 border-2 border-camp-charcoal sm:grid-cols-4">
          {CAMP_DAILY_BLOCKS.map((block, i) => (
            <div
              key={block.label}
              className="border-b border-camp-hairline p-6 sm:border-r sm:border-b-0 [&:last-child]:border-r-0"
            >
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-camp-gold uppercase">
                Bloc 0{i + 1}
              </p>
              <p className="font-display mt-3 text-lg font-bold text-camp-charcoal">
                {block.label}
              </p>
              <p className="font-mono mt-2 text-sm font-semibold text-camp-charcoal/60">
                {block.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
