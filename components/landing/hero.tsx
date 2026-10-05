import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JOIN_HREF } from "@/components/landing/landing-layout";
import { LockIcon } from "@/components/lockin/lock-icon";
import { Eyebrow, Slogan } from "@/components/lockin/primitives";

const PILLARS = [
  "Objectifs personnels",
  "Objectifs professionnels",
  "Routines quotidiennes",
  "Communauté mondiale",
];

/** Entrée du club : le slogan à gauche, le cadenas et les piliers à droite — aucune image d'interface. */
export function Hero() {
  return (
    <section className="border-b border-lk-line">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7">
          <Eyebrow className="text-lk-teal">Mouvement mondial de discipline</Eyebrow>
          <Slogan className="mt-8" />
          <p className="mt-8 max-w-md text-lg leading-relaxed text-lk-black/60">
            Rejoins le Lockin Social Club. Discipline, objectifs, routines, progression. Un club
            mondial, gratuit.
          </p>

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Link
              href={JOIN_HREF}
              className="inline-flex items-center justify-center gap-3 bg-lk-black px-8 py-4 text-sm font-medium text-lk-white transition-opacity hover:opacity-85"
            >
              Entrer dans le club <ArrowRight className="size-4" />
            </Link>
            <a
              href="#mouvement"
              className="text-sm font-medium text-lk-black underline decoration-lk-line underline-offset-8 transition-colors hover:decoration-lk-black"
            >
              Découvrir le mouvement
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <LockIcon className="mb-10 h-24 w-[72px] text-lk-black" />
          <ol className="border-t border-lk-black">
            {PILLARS.map((pillar, i) => (
              <li key={pillar} className="flex items-baseline gap-6 border-b border-lk-line py-5">
                <span className="text-xs font-medium text-lk-gold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-2xl text-lk-black sm:text-3xl">{pillar}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
