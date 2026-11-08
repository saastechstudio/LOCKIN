import { addDays } from "date-fns";
import { CalendarClock, Flag, ListChecks } from "lucide-react";

import type { CalendarItem } from "@/lib/life-os/snapshot";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "./ring";

const DAY = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const NUM = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });

/** Calendrier intelligent : 7 jours, tâches, tâches d'objectifs et échéances au même endroit. */
export function CalendarPanel({ today, items, habitsCount }: { today: Date; items: CalendarItem[]; habitsCount: number }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <Panel>
      <PanelHeader eyebrow="Calendrier intelligent" title="Les 7 prochains jours" />
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const count = items.filter((it) => sameDay(it.date, d) && !it.done).length;
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "flex flex-col items-center rounded-xl border py-2",
                i === 0 ? "border-lk-blue-soft/60 bg-lk-blue/20" : "border-lk-line bg-lk-surface",
              )}
            >
              <span className="text-[10px] text-lk-stone-3 uppercase">{DAY.format(d).replace(".", "")}</span>
              <span className="font-display text-base text-lk-black tabular-nums">{NUM.format(d)}</span>
              <span className="mt-1 flex h-1.5 gap-0.5">
                {Array.from({ length: Math.min(count, 3) }, (_, k) => (
                  <span key={k} className="size-1.5 rounded-full bg-lk-gold" />
                ))}
              </span>
            </div>
          );
        })}
      </div>
      <ul className="mt-4 space-y-2">
        {items.length === 0 ? (
          <li className="text-xs text-lk-stone-3">
            Rien de daté cette semaine{habitsCount > 0 ? ` — tes ${habitsCount} habitudes reviennent chaque jour` : ""}.
          </li>
        ) : null}
        {items.slice(0, 6).map((item) => {
          const Icon = item.kind === "deadline" ? Flag : item.kind === "goal_task" ? ListChecks : CalendarClock;
          return (
            <li key={`${item.kind}-${item.title}-${item.date.toISOString()}`} className="flex items-center gap-3 text-sm">
              <Icon className={cn("size-4 shrink-0", item.kind === "deadline" ? "text-lk-coral" : "text-lk-blue-soft")} />
              <span className={cn("min-w-0 flex-1 truncate", item.done ? "text-lk-stone-2 line-through" : "text-lk-black")}>
                {item.title}
              </span>
              <span className="shrink-0 text-xs text-lk-stone-3">
                {sameDay(item.date, today) ? "Aujourd'hui" : DAY.format(item.date)}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
