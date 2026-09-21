import { Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import type { DailyCheckin } from "@/lib/db/schema";

export function CheckinHistory({ checkins }: { checkins: DailyCheckin[] }) {
  if (checkins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun check-in cette semaine. Commence dès aujourd&apos;hui.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {checkins.map((c) => (
        <li key={c.id} className="border-b border-border/50 pb-4 last:border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {format(new Date(c.date), "EEEE d MMMM", { locale: fr })}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    "size-3.5",
                    n <= c.rating
                      ? "fill-brand-blue text-brand-blue"
                      : "text-muted-foreground/25",
                  )}
                />
              ))}
            </div>
          </div>
          {c.wins && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              <span className="text-brand-blue-deep">Victoire —</span> {c.wins}
            </p>
          )}
          {c.focusOfTomorrow && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="text-brand-blue-deep">Focus —</span>{" "}
              {c.focusOfTomorrow}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
