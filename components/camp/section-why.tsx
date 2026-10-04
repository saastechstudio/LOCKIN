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
    <section id="pourquoi" className="border-t-2 border-camp-brown bg-camp-cream px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle index="03" eyebrow="La promesse" title="Pourquoi Lock-In ?" className="mb-12" />

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <div
              key={p.word}
              className="border-b-2 border-camp-brown p-6 sm:p-8 [&:nth-child(1)]:sm:border-r-2 [&:nth-child(3)]:sm:border-r-2 [&:nth-child(3)]:sm:border-b-0 [&:nth-child(4)]:sm:border-b-0"
            >
              <span className="font-mono text-xs font-bold text-camp-gold-ink">
                0{i + 1}
              </span>
              <p className="font-display mt-2 text-3xl font-bold text-camp-brown uppercase sm:text-4xl">
                {p.word}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-camp-brown/70">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-px flex items-center justify-between gap-4 border-2 border-camp-brown bg-camp-brown px-6 py-5">
          <p className="font-display text-lg font-bold text-camp-cream uppercase sm:text-xl">
            Groupe limité à 20 participants
          </p>
          <span className="font-mono text-xs font-bold tracking-[0.15em] text-camp-gold uppercase">
            / session
          </span>
        </div>
      </div>
    </section>
  );
}
