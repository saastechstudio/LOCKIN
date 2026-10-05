import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JOIN_HREF } from "@/components/landing/landing-layout";

const PILLARS = [
  "Objectifs personnels",
  "Objectifs professionnels",
  "Routines quotidiennes",
  "Communauté mondiale",
];

/** Entrée du club : la promesse à gauche, une composition typographique à droite — aucune image d'interface. */
export function Hero() {
  return (
    <section className="border-b border-camp-hairline">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-camp-charcoal/50 uppercase">
            Mouvement mondial de discipline
          </p>
          <h1 className="mt-8 text-5xl leading-[0.95] font-semibold tracking-tight text-camp-charcoal sm:text-6xl lg:text-7xl">
            Rejoins le Lockin Social Club.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-camp-charcoal/60">
            Discipline, objectifs, entraide, réseau. Un club mondial, gratuit.
          </p>

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Link
              href={JOIN_HREF}
              className="inline-flex items-center justify-center gap-3 bg-camp-charcoal px-8 py-4 text-sm font-medium text-camp-white transition-opacity hover:opacity-85"
            >
              Entrer dans le club <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <a
              href="#mouvement"
              className="text-sm font-medium text-camp-charcoal underline decoration-camp-hairline underline-offset-8 transition-colors hover:decoration-camp-charcoal"
            >
              Découvrir le mouvement
            </a>
          </div>
        </div>

        <ol className="border-t border-camp-charcoal lg:col-span-5">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar}
              className="flex items-baseline gap-6 border-b border-camp-hairline py-5"
            >
              <span className="text-xs font-medium text-camp-gold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-2xl font-semibold tracking-tight text-camp-charcoal sm:text-3xl">
                {pillar}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
