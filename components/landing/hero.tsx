import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JOIN_HREF } from "@/components/landing/landing-layout";
import { LogoMark } from "@/components/lockin/logo-mark";
import { Slogan } from "@/components/lockin/primitives";
import { Button } from "@/components/ui/button";

const PILLARS = [
  "Objectifs personnels",
  "Objectifs professionnels",
  "Routines quotidiennes",
  "Communauté mondiale",
];

/**
 * Entrée du club. Fond blanc cassé #FAF9F7, titre marron #2C1E1A, sous-titre
 * gris #6A6764, CTA bleu #3E5C8A (survol #4A6FA5 + ombre diffuse).
 * Le panneau de droite flotte très lentement et glisse en parallax léger au
 * défilement (CSS pur, désactivé sous prefers-reduced-motion).
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Halos très doux : de la profondeur sans jamais attirer l'œil. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 size-[34rem] rounded-full bg-lk-gold/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[30rem] rounded-full bg-lk-blue-soft/10 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-lk-line bg-lk-surface px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-lk-blue uppercase shadow-xs">
            <span aria-hidden className="size-1.5 rounded-full bg-lk-coral" />
            Mouvement mondial de discipline
          </p>

          <Slogan className="animate-fade-up mt-8 [animation-delay:80ms]" />

          <p className="animate-fade-up mt-8 max-w-md text-lg leading-relaxed text-lk-stone-3 [animation-delay:160ms]">
            Rejoins le Lockin Social Club. Discipline, objectifs, routines, progression. Un club
            mondial, gratuit.
          </p>

          <div className="animate-fade-up mt-12 flex flex-col gap-6 sm:flex-row sm:items-center [animation-delay:240ms]">
            <Button asChild size="lg" className="group">
              <Link href={JOIN_HREF}>
                Entrer dans le club
                <ArrowRight className="transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </Button>
            <a
              href="#mouvement"
              className="text-sm font-medium text-lk-black underline decoration-lk-line underline-offset-8 transition-colors hover:text-lk-blue hover:decoration-lk-blue"
            >
              Découvrir le mouvement
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div data-parallax className="[--parallax-distance:56px]">
            <div className="animate-float rounded-3xl border border-lk-line bg-lk-surface p-8 shadow-xl sm:p-10">
              <LogoMark className="mb-8 h-20" />
              <ol>
                {PILLARS.map((pillar, i) => (
                  <li
                    key={pillar}
                    className="flex items-baseline gap-5 border-t border-lk-line py-4 first:border-t-0"
                  >
                    <span className="text-xs font-medium text-lk-gold tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl text-lk-black sm:text-2xl">{pillar}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
