import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_DAY_STRUCTURE } from "@/lib/camp/data";

/**
 * Programme journalier — fond noir charbon pour trancher avec la section
 * "Inclus" juste au-dessus (alternance claire/sombre plutôt qu'un dégradé).
 * Trois colonnes séparées par des filets, pas de carte.
 */
export function SectionProgram() {
  return (
    <section id="programme" className="border-t-2 border-camp-gold bg-camp-charcoal px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="02"
          eyebrow="Chaque jour"
          title="Programme journalier type"
          tone="dark"
          className="mb-12"
        />

        <div className="grid grid-cols-1 border-2 border-camp-cream/20 sm:grid-cols-3">
          {CAMP_DAY_STRUCTURE.map((block, i) => (
            <div
              key={block.period}
              className="border-b-2 border-camp-cream/20 p-6 sm:border-r-2 sm:border-b-0 sm:p-8 [&:last-child]:border-r-0"
            >
              <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
                0{i + 1} — {block.period}
              </p>
              <p className="font-display mt-3 text-xl font-bold text-camp-cream">{block.title}</p>
              {block.description ? (
                <p className="mt-2 text-sm leading-relaxed text-camp-cream/60">
                  {block.description}
                </p>
              ) : null}

              {block.blocks ? (
                <div className="mt-5 space-y-2">
                  {block.blocks.map((b, bi) => (
                    <div
                      key={b}
                      className="flex items-baseline gap-3 border border-camp-cream/20 px-3 py-2"
                    >
                      <span className="font-mono text-[11px] font-bold text-camp-turquoise">
                        {bi + 1}
                      </span>
                      <span className="text-sm text-camp-cream/80">{b}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
