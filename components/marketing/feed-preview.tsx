const SAMPLE_POST = {
  name: "Sofia R.",
  level: 4,
  content:
    "Première séance de Muay Thaï au Lock-In Camp. Douleur aujourd'hui, fierté demain.",
  tag: "Sport",
  likes: 41,
  comments: 12,
};

const GHOST_POSTS = [
  { name: "Marc L.", content: "Jour 42 de ma routine matinale. Focus total avant le sprint de ce matin." },
  { name: "Yanis B.", content: "Objectif 30 jours : lancer mon offre. J-9. Qui est dans la même phase ?" },
];

/**
 * Aperçu du feed — contenu d'illustration statique (pas de données live),
 * cartes empilées sans flou ni ombre : identité anti-IA du Social Club.
 */
export function FeedPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 border-2 border-camp-charcoal bg-camp-cream"
      />
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 -rotate-1 border-2 border-camp-charcoal bg-camp-white"
      />

      <div className="relative border-2 border-camp-charcoal bg-camp-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center border border-camp-hairline bg-camp-cream font-mono text-xs font-bold text-camp-charcoal">
            {SAMPLE_POST.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-[0.04em] text-camp-charcoal uppercase">
              {SAMPLE_POST.name}
            </p>
            <p className="font-mono text-[11px] text-camp-charcoal/40">
              Niveau {SAMPLE_POST.level}
            </p>
          </div>
          <span className="ml-auto border border-camp-hairline px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-camp-charcoal/70 uppercase">
            {SAMPLE_POST.tag}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-camp-charcoal">
          {SAMPLE_POST.content}
        </p>

        <div className="mt-4 flex items-center gap-6 border-t border-camp-hairline pt-3 font-mono text-xs font-semibold text-camp-charcoal/50">
          <span>♥ {SAMPLE_POST.likes}</span>
          <span>💬 {SAMPLE_POST.comments}</span>
        </div>
      </div>

      <div className="relative mt-4 space-y-2 opacity-70">
        {GHOST_POSTS.map((p) => (
          <div
            key={p.name}
            className="truncate border border-camp-hairline bg-camp-white px-3.5 py-2.5 text-xs text-camp-charcoal/60"
          >
            <span className="font-mono font-bold text-camp-charcoal uppercase">{p.name}</span>
            {" — "}
            {p.content}
          </div>
        ))}
      </div>
    </div>
  );
}
