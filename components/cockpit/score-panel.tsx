import { COMPONENT_LABELS, type ScoreComponents } from "@/lib/life-os/score";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/count-up";
import { Panel, PanelHeader } from "./ring";

const WEEKDAY = new Intl.DateTimeFormat("fr-FR", { weekday: "narrow" });

/** Composantes du LockIn Score et sa courbe sur 7 jours (barres verticales). */
export function ScorePanel({
  score,
  yesterday,
  components,
  week,
  weakest,
}: {
  score: number;
  yesterday: number | null;
  components: ScoreComponents;
  week: { date: Date; score: number }[];
  weakest: keyof ScoreComponents;
}) {
  const delta = yesterday === null ? null : score - yesterday;
  const max = Math.max(100, ...week.map((d) => d.score));
  return (
    <Panel>
      <PanelHeader
        eyebrow="LockIn Score"
        title={
          <span className="flex items-baseline gap-2">
            <CountUp value={score} className="tabular-nums" />
            {delta !== null ? (
              <span className={cn("text-sm", delta >= 0 ? "text-lk-gold" : "text-lk-coral")}>
                {delta >= 0 ? "+" : ""}
                {delta} vs hier
              </span>
            ) : null}
          </span>
        }
      />

      <ul className="mt-5 space-y-3">
        {(Object.keys(components) as (keyof ScoreComponents)[]).map((key, index) => {
          const value = components[key];
          return (
            <li key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className={cn(key === weakest ? "text-lk-coral" : "text-lk-stone-3")}>
                  {COMPONENT_LABELS[key]}
                  {key === weakest ? " · levier" : ""}
                </span>
                <span className="text-lk-black tabular-nums">{value === null ? "—" : <CountUp value={value} />}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-lk-surface">
                <div
                  className={cn(
                    "lk-grow-x h-full rounded-full",
                    key === weakest ? "bg-lk-coral" : "bg-lk-blue-soft",
                  )}
                  style={{ width: `${value ?? 0}%`, boxShadow: "0 0 10px currentColor", "--i": index } as React.CSSProperties}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">7 derniers jours</p>
        <div className="mt-3 flex items-end gap-2" role="img" aria-label="Score des 7 derniers jours">
          {week.map((d, i) => {
            const today = i === week.length - 1;
            return (
              <div key={d.date.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-[72px] w-full items-end">
                  <div
                    className={cn(
                      "lk-grow-y w-full rounded-md",
                      today ? "bg-lk-gold shadow-[0_0_16px_rgba(209,250,229,0.6)]" : "bg-lk-blue-soft/60",
                    )}
                    style={{ height: `${Math.max(4, (d.score / max) * 100)}%`, "--i": i } as React.CSSProperties}
                    title={`${d.score}`}
                  />
                </div>
                <span className={cn("text-[10px] uppercase", today ? "text-lk-black" : "text-lk-stone-2")}>
                  {WEEKDAY.format(d.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
