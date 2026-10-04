import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_DAILY_BLOCKS } from "@/lib/camp/data";

/**
 * Détail chronométré de la session Lock-In du soir (2h). Fond charbon,
 * quatre blocs en ligne, la durée affichée comme un repère chiffré plutôt
 * qu'une icône d'horloge.
 */
export function SectionDailyStructure() {
  return (
    <section
      id="structure-quotidienne"
      className="border-t-2 border-camp-gold bg-camp-charcoal px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="04"
          eyebrow="La session du soir"
          title="Structure quotidienne — 2h"
          tone="dark"
          className="mb-12"
        />

        <div className="grid grid-cols-1 border-2 border-camp-cream/20 sm:grid-cols-4">
          {CAMP_DAILY_BLOCKS.map((block, i) => (
            <div
              key={block.label}
              className="border-b-2 border-camp-cream/20 p-6 sm:border-r-2 sm:border-b-0 [&:last-child]:border-r-0"
            >
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-camp-turquoise uppercase">
                Bloc 0{i + 1}
              </p>
              <p className="font-display mt-3 text-lg font-bold text-camp-cream">{block.label}</p>
              <p className="font-mono mt-2 text-sm font-semibold text-camp-gold">
                {block.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
