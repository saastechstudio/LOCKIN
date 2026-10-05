import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Les étapes réelles du rituel d'inscription (/dashboard/rituel-lockin). */
const STEPS = ["Ta motivation", "Tes objectifs", "Ton sport", "Ta routine"];

export function SectionMotivation() {
  return (
    <section className="border-b border-camp-hairline">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-camp-charcoal/50 uppercase">
            Inscription par motivation
          </p>
          <h2 className="mt-8 text-4xl leading-[1.02] font-semibold tracking-tight text-camp-charcoal sm:text-6xl">
            On ne s&apos;inscrit pas.
            <br />
            On s&apos;engage.
          </h2>
        </div>

        <div className="lg:col-span-5 lg:pt-16">
          <p className="text-lg leading-relaxed text-camp-charcoal/70">
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

          <Link
            href="/sign-up"
            className="mt-10 inline-flex items-center gap-3 bg-camp-charcoal px-8 py-4 text-sm font-medium text-camp-white transition-opacity hover:opacity-85"
          >
            Commencer mon engagement Lockin <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
