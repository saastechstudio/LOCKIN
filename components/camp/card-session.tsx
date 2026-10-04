import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CampSessionWithAvailability } from "@/lib/actions/camp";

type CardSessionProps = {
  session: CampSessionWithAvailability;
  index: string;
};

/**
 * Bloc "session" brutaliste — pas de carte flottante : un cadre à angles
 * droits, un gros numéro de session, les chiffres qui comptent (dates,
 * places, prix) en avant, et une barre CTA pleine largeur en pied de bloc.
 */
export function CardSession({ session, index }: CardSessionProps) {
  const isFull = session.remainingSpots <= 0;

  return (
    <div className="camp-hard-sm border-2 border-camp-brown bg-camp-cream">
      <div className="flex flex-col gap-6 border-b-2 border-camp-brown p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold tracking-[0.25em] text-camp-gold-ink uppercase">
            {index} — {session.name}
          </p>
          <p className="font-display mt-2 text-2xl leading-none font-bold text-camp-brown uppercase sm:text-3xl">
            {format(session.startDate, "d", { locale: fr })} →{" "}
            {format(session.endDate, "d MMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-mono text-2xl font-bold text-camp-brown">
            {session.pricePerPerson.toLocaleString("fr-FR")} €
          </p>
          <p
            className={cn(
              "font-mono text-xs font-semibold tracking-[0.1em] uppercase",
              isFull ? "text-camp-brown/50" : "text-camp-turquoise",
            )}
          >
            {isFull ? "Complet" : `${session.remainingSpots} / ${session.totalSpots} places`}
          </p>
        </div>
      </div>

      {isFull ? (
        <div className="flex items-center justify-center p-5 font-mono text-sm font-bold tracking-[0.15em] text-camp-brown/40 uppercase">
          Session complète
        </div>
      ) : (
        <Link
          href={`/camp/${session.slug}/reserver`}
          className="group flex items-center justify-between bg-camp-brown p-5 text-camp-cream transition-colors hover:bg-camp-charcoal"
        >
          <span className="font-mono text-sm font-bold tracking-[0.15em] uppercase">
            Je verrouille cette session
          </span>
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
