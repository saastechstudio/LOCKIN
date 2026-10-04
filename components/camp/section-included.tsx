import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_INCLUDED_ITEMS, CAMP_PROGRAM_BLOCKS, SPORT_ACTIVITIES } from "@/lib/camp/data";

/**
 * Grille typographique — pas de puces, pas d'icônes en cercle flou. Chaque
 * ligne porte son propre numéro et une bordure comme seule séparation.
 * Les deux entrées qui ont un sous-détail (sport, programme) le montrent
 * en petits tags mono plutôt qu'en liste imbriquée.
 */
export function SectionIncluded() {
  return (
    <section id="inclus" className="border-t-2 border-camp-brown bg-camp-cream px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="01"
          eyebrow="2 500 € / personne"
          title="Ce qui est inclus"
          className="mb-12"
        />

        <div className="border-2 border-camp-brown">
          {CAMP_INCLUDED_ITEMS.map((item, i) => {
            const n = String(i + 1).padStart(2, "0");
            const isSport = item.startsWith("Activités sportives");
            const isProgram = item.startsWith("2h de programme");

            return (
              <div
                key={item}
                className="flex flex-col gap-3 border-b-2 border-camp-brown px-6 py-6 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="font-mono text-xs font-bold text-camp-gold-ink">{n}</span>
                <div className="flex-1">
                  <p className="font-display text-lg font-bold text-camp-brown sm:text-xl">
                    {item}
                  </p>
                  {isSport ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SPORT_ACTIVITIES.map((a) => (
                        <span
                          key={a.id}
                          className="border border-camp-brown/30 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-camp-brown/70 uppercase"
                        >
                          {a.emoji} {a.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {isProgram ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {CAMP_PROGRAM_BLOCKS.map((b) => (
                        <span
                          key={b}
                          className="border border-camp-brown/30 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.08em] text-camp-brown/70 uppercase"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
