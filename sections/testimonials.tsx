import { Reveal } from "@/components/ui/reveal";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

/**
 * Témoignages : citations sur cartes blanches, lecture calme (pas de
 * carrousel automatique). Les citations sont passées en props : n'affiche ici
 * que des témoignages réels et autorisés par leurs auteurs.
 */
export function Testimonials({
  items,
  eyebrow = "Ils sont lock in",
  title = "Des membres, pas des spectateurs.",
}: {
  items: Testimonial[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="bg-lk-mist">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-blue uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display mt-5 text-4xl text-lk-black sm:text-5xl">{title}</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={i * 120}>
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-lk-line bg-lk-surface p-8 shadow-sm transition-[box-shadow,border-color] duration-300 ease-premium hover:border-lk-gold hover:shadow-md">
                <blockquote className="font-display text-xl leading-snug text-lk-black">
                  &laquo;&nbsp;{item.quote}&nbsp;&raquo;
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-3 border-t border-lk-line pt-6">
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-full bg-lk-blue/10 text-sm font-medium text-lk-blue"
                  >
                    {item.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-lk-black">{item.name}</span>
                    <span className="block text-xs text-lk-stone-3">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
