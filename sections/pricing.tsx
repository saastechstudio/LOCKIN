import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  name: string;
  /** Prix affiché tel quel (« 0 € », « 19 € »…). */
  price: string;
  /** Périodicité affichée à côté du prix (« / mois »). */
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  /** Un seul plan recommandé : accent bleu, ombre bleue, léger agrandissement. */
  recommended?: boolean;
};

/**
 * Grille de tarifs : 3 plans. Le plan recommandé porte l'accent bleu focus
 * (#3E5C8A) ; les autres restent sobres. Les plans sont passés en props :
 * le composant ne contient aucun prix en dur.
 */
export function Pricing({
  plans,
  eyebrow = "Tarifs",
  title = "Choisis ton rythme.",
}: {
  plans: PricingPlan[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section id="tarifs" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-blue uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display mt-5 text-4xl text-lk-black sm:text-5xl">{title}</h2>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 120}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-lk-surface p-8",
        "transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:-translate-y-0.5",
        plan.recommended
          ? "border-lk-blue shadow-focus md:scale-[1.03]"
          : "border-lk-line shadow-sm hover:border-lk-gold hover:shadow-md",
      )}
    >
      {plan.recommended ? (
        <span className="absolute -top-3 left-8 rounded-full bg-lk-blue px-3 py-1 text-xs font-medium text-white">
          Recommandé
        </span>
      ) : null}

      <h3 className="font-display text-xl text-lk-black">{plan.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-lk-stone-3">{plan.description}</p>

      <p className="mt-8 flex items-baseline gap-1.5">
        <span className="font-display text-5xl text-lk-black tabular-nums">{plan.price}</span>
        {plan.period ? <span className="text-sm text-lk-stone-3">{plan.period}</span> : null}
      </p>

      <ul className="mt-8 flex-1 space-y-3 border-t border-lk-line pt-8 text-sm text-lk-black">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              className={cn("mt-0.5 size-4 shrink-0", plan.recommended ? "text-lk-blue" : "text-lk-gold")}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        variant={plan.recommended ? "default" : "outline"}
        className="mt-10 w-full"
      >
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>
    </article>
  );
}
