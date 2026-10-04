import { SectionTitle } from "@/components/camp/section-title";
import { CAMP_PROGRAM_PARTS } from "@/lib/camp/data";

/**
 * Le programme Lock-In officiel (2h/jour), en 5 parties — pas des cartes,
 * une colonne de blocs typographiques empilés : le numéro de partie en
 * grand, le titre, puis les trois points comme une liste à filets plutôt
 * que des puces.
 */
export function SectionProgramLockIn() {
  return (
    <section
      id="programme-lockin"
      className="border-t-2 border-camp-brown bg-camp-cream px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="03"
          eyebrow="2h par jour"
          title="Le programme Lock-In"
          description="Cinq parties, un seul fil conducteur : du pourquoi à l'ancrage durable."
          className="mb-12"
        />

        <div className="border-2 border-camp-brown">
          {CAMP_PROGRAM_PARTS.map((part) => (
            <div
              key={part.number}
              className="grid grid-cols-1 gap-4 border-b-2 border-camp-brown p-6 last:border-b-0 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8"
            >
              <span className="font-display text-5xl leading-none font-bold text-camp-gold sm:text-6xl">
                {part.number}
              </span>
              <div>
                <p className="font-display text-xl font-bold text-camp-brown uppercase sm:text-2xl">
                  {part.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {part.items.map((item) => (
                    <li
                      key={item}
                      className="border-t border-camp-brown/20 pt-2 text-sm leading-relaxed text-camp-brown/80 first:border-t-0 first:pt-0"
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
