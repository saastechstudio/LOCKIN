import { cn } from "@/lib/utils";

/**
 * Barre de progression rectangulaire. Jusqu'à 30 étapes : un segment carré
 * par chapitre (plein = terminé) — on voit chaque pas. Au-delà : une jauge pleine.
 */
export function ProgressBarRect({
  done,
  total,
  className,
  showLabel = true,
}: {
  done: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}) {
  const safeTotal = Math.max(0, total);
  const safeDone = Math.min(Math.max(0, done), safeTotal);
  const percent = safeTotal === 0 ? 0 : Math.round((safeDone / safeTotal) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Progression : ${safeDone} chapitre${safeDone > 1 ? "s" : ""} sur ${safeTotal}`}
        className="flex h-3 w-full gap-px border border-lk-line bg-lk-white"
      >
        {safeTotal > 0 && safeTotal <= 30 ? (
          Array.from({ length: safeTotal }, (_, i) => (
            <span key={i} className={cn("h-full flex-1", i < safeDone ? "bg-lk-black" : "bg-lk-line")} />
          ))
        ) : (
          <span className="h-full bg-lk-black" style={{ width: `${percent}%` }} />
        )}
      </div>
      {showLabel ? (
        <p className="mt-2 text-xs text-lk-stone-3 tabular-nums">
          {safeDone}/{safeTotal} chapitre{safeTotal > 1 ? "s" : ""} · {percent} %
        </p>
      ) : null}
    </div>
  );
}
