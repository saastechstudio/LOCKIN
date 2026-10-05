import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section className="border-b border-camp-hairline">
      <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-camp-charcoal/50 uppercase">
          À l&apos;intérieur
        </p>
        <h2 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-camp-charcoal sm:text-5xl">
          Ce que tu fais à l&apos;intérieur.
        </h2>

        <div className="mt-16 grid gap-px border border-camp-hairline bg-camp-hairline sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action) => (
            <div key={action} className="flex min-h-28 items-end bg-camp-white p-8 sm:min-h-40">
              <p className="text-xl font-semibold tracking-tight text-camp-charcoal">{action}</p>
            </div>
          ))}
          <Link
            href="/sign-up"
            className="group flex min-h-28 items-end justify-between sm:min-h-40 bg-camp-charcoal p-8 text-camp-white transition-opacity hover:opacity-90"
          >
            <span className="text-xl font-semibold tracking-tight">Entrer dans le club</span>
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
