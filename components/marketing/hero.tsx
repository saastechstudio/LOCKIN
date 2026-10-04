import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FeedPreview } from "@/components/marketing/feed-preview";

export function Hero() {
  return (
    <section className="camp-scope border-b border-camp-hairline px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
            Lockin Social Club
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] font-bold text-camp-charcoal uppercase sm:text-5xl lg:text-6xl">
            Le réseau social
            <br />
            de la discipline
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-camp-charcoal/70">
            Feed, objectifs, groupes, entraide. Une communauté internationale
            d&apos;entrepreneurs et de sportifs qui avancent, jour après
            jour. Gratuit, sans publicité.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal bg-camp-gold px-6 py-3.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase"
            >
              Rejoindre le Club <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/methode"
              className="inline-flex items-center justify-center gap-2 border-2 border-camp-charcoal px-6 py-3.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase hover:bg-camp-cream"
            >
              Découvrir la Méthode
            </Link>
          </div>

          <p className="mt-6 font-mono text-[11px] tracking-[0.1em] text-camp-charcoal/40 uppercase">
            Feed · Objectifs · Groupes · Entraide · Messages
          </p>
        </div>

        <FeedPreview />
      </div>
    </section>
  );
}
