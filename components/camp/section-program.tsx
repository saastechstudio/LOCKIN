import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_DAY_STRUCTURE } from "@/lib/camp/data";

/**
 * Programme journalier — fond blanc, trois colonnes séparées par des
 * filets fins, pas de carte, pas de bloc de couleur.
 */
export function SectionProgram() {
  return (
    <section id="programme" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="02"
          eyebrow="Chaque jour"
          title="Programme journalier type"
          className="mb-12"
        />

        <div className="grid grid-cols-1 border-2 border-camp-charcoal sm:grid-cols-3">
          {CAMP_DAY_STRUCTURE.map((block, i) => (
            <div
              key={block.period}
              className="border-b border-camp-hairline p-6 sm:border-r sm:border-b-0 sm:p-8 [&:last-child]:border-r-0"
            >
              <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
                0{i + 1} — {block.period}
              </p>
              <p className="font-display mt-3 text-xl font-bold text-camp-charcoal">
                {block.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-camp-charcoal/60">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
