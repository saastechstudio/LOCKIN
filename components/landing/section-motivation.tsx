import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JOIN_HREF } from "@/components/landing/landing-layout";
import { Button } from "@/components/ui/button";

/** Les étapes réelles du rituel d'inscription (/rejoindre). */
const STEPS = ["Ta motivation", "Tes objectifs", "Ton sport", "Ta routine"];

export function SectionMotivation() {
  return (
    <section className="border-b border-camp-hairline">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Inscription par motivation
          </p>
          <h2 className="mt-8 text-4xl leading-[1.02] font-semibold tracking-tight text-camp-charcoal sm:text-6xl">
            On ne s&apos;inscrit pas.
            <br />
            On s&apos;engage.
          </h2>
        </div>

        <div className="lg:col-span-5 lg:pt-16">
          <p className="text-lg leading-relaxed text-lk-stone-3">
            Pour entrer dans le Lockin Social Club, tu écris ta motivation, tu
            choisis tes objectifs, ton sport, ta routine. C&apos;est ton premier
            acte de discipline.
          </p>

          <ol className="mt-10 border-t border-camp-hairline">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className="flex items-baseline gap-5 border-b border-camp-hairline py-3.5 text-sm text-camp-charcoal"
              >
                <span className="text-xs font-medium text-camp-gold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <Button asChild size="lg" className="group mt-10">
            <Link href={JOIN_HREF}>
              Commencer mon engagement Lockin
              <ArrowRight className="transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
