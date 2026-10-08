import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JOIN_HREF } from "@/components/landing/landing-layout";
import { Reveal } from "@/components/ui/reveal";

const ACTIONS = [
  "Fixer tes objectifs",
  "Suivre tes routines",
  "Partager tes progrès",
  "Rejoindre des groupes par ville, sport ou métier",
  "Poser des questions, aider les autres",
];

/**
 * Grille à filets fins (gap-px sur fond hairline). Cinq actions sur une
 * grille de trois colonnes laissent une case : elle porte l'appel à entrer
 * plutôt que de rester vide.
 */
export function SectionInside() {
  return (
    <section className="border-b border-lk-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
          À l&apos;intérieur
        </p>
        <h2 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-camp-charcoal sm:text-5xl">
          Ce que tu fais à l&apos;intérieur.
        </h2>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action) => (
            <Reveal key={action}>
              <div className="flex min-h-28 items-end rounded-2xl border border-lk-line bg-lk-surface p-8 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-premium hover:-translate-y-0.5 hover:border-lk-gold hover:shadow-gold sm:min-h-40">
                <p className="font-display text-xl text-lk-black">{action}</p>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <Link
              href={JOIN_HREF}
              className="group flex min-h-28 items-end justify-between rounded-2xl bg-lk-blue p-8 text-white shadow-sm transition-[transform,box-shadow,background-color] duration-300 ease-premium hover:-translate-y-0.5 hover:bg-lk-blue-soft hover:shadow-focus sm:min-h-40"
            >
              <span className="font-display text-xl">Entrer dans le club</span>
              <ArrowRight className="size-5 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
