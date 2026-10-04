import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, Plane } from "lucide-react";

import { CAMP_EDITION, CAMP_PRICE_PER_PERSON, CAMP_SESSIONS_SEED } from "@/lib/camp/data";

/**
 * Module "Lock-In Camp" sur la page d'accueil — visible et cliquable sans
 * compte. Données statiques uniquement (pas d'appel DB ici) : la page
 * d'accueil ne doit jamais dépendre de la disponibilité des places pour
 * s'afficher.
 */
export function HomeModuleLockInCamp() {
  const [session1, session2] = CAMP_SESSIONS_SEED;

  return (
    <section className="px-6 py-16">
      <Link
        href="/camp"
        className="camp-scope mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl border border-camp-border bg-camp-card px-8 py-10 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-camp-brown text-camp-cream">
            <Plane className="size-5" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camp-sand">
              Lock-In Camp
            </p>
            <h2 className="font-display text-2xl text-camp-brown-deep">{CAMP_EDITION}</h2>
            <p className="text-sm text-camp-brown-soft">
              {format(new Date(session1.startDate), "d", { locale: fr })} →{" "}
              {format(new Date(session1.endDate), "d MMM", { locale: fr })} ·{" "}
              {format(new Date(session2.startDate), "d", { locale: fr })} →{" "}
              {format(new Date(session2.endDate), "d MMM yyyy", { locale: fr })}
            </p>
            <p className="text-sm font-medium text-camp-brown-deep">
              {CAMP_PRICE_PER_PERSON.toLocaleString("fr-FR")} € · Vol Paris inclus
            </p>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-camp-brown px-5 py-2.5 text-sm font-semibold text-camp-cream sm:self-center">
          Découvrir le programme <ArrowRight className="size-4" />
        </span>
      </Link>
    </section>
  );
}
