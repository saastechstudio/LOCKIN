import { SectionTitle } from "@/components/camp/section-title";

const PILLARS = [
  { word: "Discipline", text: "Un cadre qui ne négocie pas — le camp impose le rythme." },
  { word: "Performance", text: "Sport, mindset, business : trois leviers, une seule semaine." },
  { word: "Focus", text: "Coupé du bruit habituel, concentré sur ce qui compte." },
  { word: "Reset", text: "Repartir avec un plan d'action, pas juste des souvenirs." },
];

/** Quatre mots forts en grille asymétrique, pas quatre icônes dans des cercles. */
export function SectionWhy() {
  return (
    <section id="pourquoi" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle index="07" eyebrow="La promesse" title="Pourquoi Lock-In ?" className="mb-12" />

        <div className="grid grid-cols-1 gap-0 border-t border-l border-camp-hairline sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <div key={p.word} className="border-r border-b border-camp-hairline p-6 sm:p-8">
              <span className="text-xs font-bold text-camp-gold">0{i + 1}</span>
              <p className="font-display mt-2 text-3xl text-camp-charcoal sm:text-4xl">
                {p.word}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-lk-stone-3">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border border-lk-line px-6 py-5">
          <p className="font-display text-lg text-camp-charcoal sm:text-xl">
            Groupe limité à 20 participants
          </p>
          <span className="text-xs font-bold tracking-[0.15em] text-camp-gold uppercase">
            / session
          </span>
        </div>
      </div>
    </section>
  );
}
