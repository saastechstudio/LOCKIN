const BLOCKS = [
  {
    title: "Discipline",
    text: "Un espace pour tes objectifs, tes routines, ta progression.",
  },
  {
    title: "Entraide",
    text: "Une communauté qui te soutient, te répond, te pousse.",
  },
  {
    title: "Réseau",
    text: "Des gens ambitieux, partout dans le monde, connectés par le même club.",
  },
];

/** Cible du lien "Découvrir le mouvement" du Hero (#mouvement). */
export function SectionWhatIsLockin() {
  return (
    <section id="mouvement" className="scroll-mt-16 border-b border-camp-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-camp-charcoal/50 uppercase">
          Ce qu&apos;est Lockin
        </p>

        <div className="mt-16 grid border-t border-camp-charcoal md:grid-cols-3">
          {BLOCKS.map((block, i) => (
            <div
              key={block.title}
              className="border-b border-camp-hairline py-10 md:border-b-0 md:py-12 md:pr-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-10"
            >
              <span className="text-xs font-medium text-camp-gold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-camp-charcoal sm:text-4xl">
                {block.title}
              </h2>
              <p className="mt-4 max-w-xs text-base leading-relaxed text-camp-charcoal/60">
                {block.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
