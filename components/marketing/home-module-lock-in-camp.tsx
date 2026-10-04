import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

import { CAMP_EDITION, CAMP_PRICE_PER_PERSON, CAMP_SESSIONS_SEED } from "@/lib/camp/data";

/**
 * Module "Lock-In Camp" sur la page d'accueil — visible et cliquable sans
 * compte. Volontairement brutaliste (angles droits, ombre dure, noir
 * charbon) pour trancher avec le reste de l'accueil et signaler qu'on entre
 * dans une sous-identité différente. Données statiques uniquement (pas
 * d'appel DB ici) : la page d'accueil ne doit jamais dépendre de la
 * disponibilité des places pour s'afficher.
 */
export function HomeModuleLockInCamp() {
  const [session1, session2] = CAMP_SESSIONS_SEED;

  return (
    <section className="px-6 py-16">
      <Link
        href="/camp"
        className="group mx-auto flex max-w-4xl flex-col gap-6 border-2 border-camp-charcoal bg-camp-charcoal px-8 py-10 text-left shadow-[8px_8px_0_0_var(--camp-gold)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-2.5">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-turquoise uppercase">
            Hors les murs — Édition Phuket
          </p>
          <h2 className="font-display text-2xl font-bold text-camp-cream uppercase sm:text-3xl">
            {CAMP_EDITION}
          </h2>
          <p className="font-mono text-xs text-camp-cream/60 uppercase">
            {format(new Date(session1.startDate), "d", { locale: fr })} →{" "}
            {format(new Date(session1.endDate), "d MMM", { locale: fr })} ·{" "}
            {format(new Date(session2.startDate), "d", { locale: fr })} →{" "}
            {format(new Date(session2.endDate), "d MMM yyyy", { locale: fr })}
          </p>
          <p className="font-display text-lg font-bold text-camp-gold">
            {CAMP_PRICE_PER_PERSON.toLocaleString("fr-FR")} € · Vol Paris inclus
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start border-2 border-camp-cream px-5 py-2.5 font-mono text-xs font-bold tracking-[0.1em] text-camp-cream uppercase sm:self-center">
          Découvrir le programme
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </section>
  );
}
