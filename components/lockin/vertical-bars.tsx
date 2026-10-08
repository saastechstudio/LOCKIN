import { cn } from "@/lib/utils";

export type VerticalBar = {
  key: string;
  /** 0–100 ; null = pas de donnée (barre vide, contour pointillé). */
  value: number | null;
  label?: string;
  /** Libellé lisible par lecteur d'écran, ex. « 3 octobre : 70 ». */
  title?: string;
  /** Palier ou objectif atteint : doré mat. */
  accent?: boolean;
  /** Ce qui est en cours (aujourd'hui) : bleu-vert. */
  live?: boolean;
};

/**
 * Graphique Lockin : barres verticales, angles droits, noir sur blanc.
 * Aucun camembert dans l'app — la progression se lit de bas en haut.
 */
export function VerticalBars({
  bars,
  height = 160,
  className,
  showLabels = true,
}: {
  bars: VerticalBar[];
  height?: number;
  className?: string;
  showLabels?: boolean;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative flex items-end gap-[3px] border-b border-lk-line"
        style={{ height }}
        role="img"
        aria-label={bars.map((b) => b.title ?? `${b.label ?? b.key} : ${b.value ?? "—"}`).join(", ")}
      >
        {/* Repères à 50 et 100 : deux filets, rien de plus. */}
        <span className="pointer-events-none absolute inset-x-0 top-0 border-t border-lk-line" aria-hidden />
        <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-lk-line" aria-hidden />
        {bars.map((bar) => (
          <div key={bar.key} className="relative flex h-full flex-1 items-end" title={bar.title}>
            {bar.value === null ? (
              <div className="h-1 w-full border-t border-dashed border-lk-line" />
            ) : (
              <div
                className={cn("w-full", bar.live ? "bg-lk-teal" : bar.accent ? "bg-lk-gold" : "bg-lk-black")}
                style={{ height: `${Math.max(2, Math.min(100, bar.value))}%` }}
              />
            )}
          </div>
        ))}
      </div>
      {showLabels ? (
        <div className="mt-2 flex gap-[3px]">
          {bars.map((bar) => (
            <span
              key={bar.key}
              className="flex-1 truncate text-center text-[10px] text-lk-stone-3 tabular-nums"
            >
              {bar.label ?? ""}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
