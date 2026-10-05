import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_PROGRAM_PARTS } from "@/lib/camp/data";

/**
 * Le programme Lock-In officiel (2h/jour), en 5 parties — pas des cartes,
 * une colonne de blocs typographiques empilés sur fond blanc : le numéro
 * de partie en doré mat, le titre, puis les trois points comme une liste
 * à filets plutôt que des puces.
 */
export function SectionProgramLockIn() {
  return (
    <section id="programme-lockin" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="03"
          eyebrow="2h par jour"
          title="Le programme Lock-In"
          description="Cinq parties, un seul fil conducteur : du pourquoi à l'ancrage durable."
          className="mb-12"
        />

        <div className="border border-camp-charcoal">
          {CAMP_PROGRAM_PARTS.map((part) => (
            <div
              key={part.number}
              className="grid grid-cols-1 gap-4 border-b border-camp-hairline p-6 last:border-b-0 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8"
            >
              <span className="font-display text-5xl leading-none text-camp-gold sm:text-6xl">
                {part.number}
              </span>
              <div>
                <p className="font-display text-xl text-camp-charcoal sm:text-2xl">
                  {part.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {part.items.map((item) => (
                    <li
                      key={item}
                      className="border-t border-camp-hairline pt-2 text-sm leading-relaxed text-camp-charcoal/70 first:border-t-0 first:pt-0"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
