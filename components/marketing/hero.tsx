import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeedPreview } from "@/components/marketing/feed-preview";

export function Hero() {
  return (
    <section className="camp-scope border-b border-camp-hairline px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.3em] text-camp-gold uppercase">
            Lockin Social Club
          </p>
          <h1 className="font-display mt-6 text-4xl leading-[1.08] font-bold text-camp-charcoal sm:text-5xl lg:text-[3.5rem]">
            Le réseau social
            <br />
            de la discipline
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-camp-charcoal/60">
            Feed, objectifs, groupes, entraide. Une communauté internationale
            d&apos;entrepreneurs et de sportifs qui avancent, jour après
            jour. Gratuit, sans publicité.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal bg-camp-charcoal px-7 py-3.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-white uppercase transition-colors hover:bg-camp-gold hover:text-camp-charcoal"
            >
              Rejoindre le Club <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/methode"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-charcoal/70 uppercase transition-colors hover:text-camp-charcoal"
            >
              Découvrir la Méthode
            </Link>
          </div>

          <p className="mt-12 font-mono text-[11px] tracking-[0.15em] text-camp-charcoal/35 uppercase">
            Feed — Objectifs — Groupes — Entraide — Messages
          </p>
        </div>

        <FeedPreview />
      </div>
    </section>
  );
}
