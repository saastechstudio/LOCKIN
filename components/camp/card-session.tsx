import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, MapPin, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CampSessionWithAvailability } from "@/lib/actions/camp";

type CardSessionProps = {
  session: CampSessionWithAvailability;
};

/** Carte résumé d'une session du camp — peu de texte : dates, lieu, places restantes, prix. */
export function CardSession({ session }: CardSessionProps) {
  const isFull = session.remainingSpots <= 0;

  return (
    <Link href={`/dashboard/camp/${session.slug}`} className="block">
      <Card className="camp-scope border-camp-border bg-camp-card transition-all hover:-translate-y-0.5 hover:shadow-soft-md">
        <CardContent className="flex items-center justify-between gap-4 px-6">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-camp-brown-soft">{session.name}</p>
            <p className="font-display text-lg text-camp-brown-deep">
              {format(session.startDate, "d MMM", { locale: fr })} –{" "}
              {format(session.endDate, "d MMM yyyy", { locale: fr })}
            </p>
            <div className="flex items-center gap-3 text-xs text-camp-brown-soft">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {session.destination}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {isFull ? "Complet" : `${session.remainingSpots} places restantes`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isFull ? "destructive" : "default"}
              className={isFull ? undefined : "border-camp-sand/40 bg-camp-sand/15 text-camp-brown-deep"}
            >
              {session.pricePerPerson.toLocaleString("fr-FR")} €
            </Badge>
            <ArrowRight className="size-4 text-camp-brown-soft" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
