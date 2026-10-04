const SAMPLE_POST = {
  name: "Sofia R.",
  level: 4,
  content:
    "Première séance de Muay Thaï au Lock-In Camp. Douleur aujourd'hui, fierté demain.",
  tag: "Sport",
  likes: 41,
  comments: 12,
};

/**
 * Aperçu du feed — contenu d'illustration statique (pas de données live).
 * Une seule carte nette, un filet de profondeur sobre derrière plutôt
 * qu'un empilement : épuré, pas un gadget d'app store.
 */
export function FeedPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2.5 translate-y-2.5 border-2 border-camp-charcoal bg-camp-cream"
      />

      <div className="relative border-2 border-camp-charcoal bg-camp-white p-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center border border-camp-hairline bg-camp-cream font-mono text-xs font-bold text-camp-charcoal">
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
          <span className="ml-auto border border-camp-hairline px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-camp-charcoal/60 uppercase">
            {SAMPLE_POST.tag}
          </span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-camp-charcoal">
          {SAMPLE_POST.content}
        </p>

        <div className="mt-6 flex items-center gap-6 border-t border-camp-hairline pt-4 font-mono text-xs font-semibold text-camp-charcoal/40">
          <span>♥ {SAMPLE_POST.likes}</span>
          <span>💬 {SAMPLE_POST.comments}</span>
        </div>
      </div>
    </div>
  );
}
