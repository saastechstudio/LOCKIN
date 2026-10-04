import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

import { CAMP_EDITION, CAMP_PRICE_PER_PERSON, CAMP_SESSIONS_SEED } from "@/lib/camp/data";

/**
 * Module "Lock-In Camp" sur la page d'accueil — visible et cliquable sans
 * compte. Volontairement sombre (noir charbon) pour trancher avec le reste
 * de l'accueil et signaler qu'on entre dans une sous-identité différente —
 * mais sans ombre, comme le reste de l'identité camp. Données statiques
 * uniquement (pas d'appel DB ici) : la page d'accueil ne doit jamais
 * dépendre de la disponibilité des places pour s'afficher.
 */
export function HomeModuleLockInCamp() {
  const [session1, session2] = CAMP_SESSIONS_SEED;

  return (
    <section className="px-6 py-16">
      <Link
        href="/camp"
        className="group mx-auto flex max-w-4xl flex-col gap-6 border-2 border-camp-charcoal bg-camp-charcoal px-8 py-10 text-left shadow-none transition-colors hover:bg-camp-gold sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-2.5">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase group-hover:text-camp-charcoal">
            Hors les murs — Édition Phuket
          </p>
          <h2 className="font-display text-2xl font-bold text-camp-white uppercase group-hover:text-camp-charcoal sm:text-3xl">
            {CAMP_EDITION}
          </h2>
          <p className="font-mono text-xs text-camp-white/60 uppercase group-hover:text-camp-charcoal/70">
            {format(new Date(session1.startDate), "d", { locale: fr })} →{" "}
            {format(new Date(session1.endDate), "d MMM", { locale: fr })} ·{" "}
            {format(new Date(session2.startDate), "d", { locale: fr })} →{" "}
            {format(new Date(session2.endDate), "d MMM yyyy", { locale: fr })}
          </p>
          <p className="font-display text-lg font-bold text-camp-white group-hover:text-camp-charcoal">
            {CAMP_PRICE_PER_PERSON.toLocaleString("fr-FR")} € · Vol Paris inclus
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start border-2 border-camp-white px-5 py-2.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-white uppercase group-hover:border-camp-charcoal group-hover:text-camp-charcoal sm:self-center">
          Découvrir le programme
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </section>
  );
}
