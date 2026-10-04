import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Excursion } from "@/lib/camp/data";

type CardExcursionProps = {
  excursion: Excursion;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/** Bloc sélectionnable (excursion ou activité fun) — fond blanc, filet fin, sélection en aplat charbon. */
export function CardExcursion({ excursion, selected, disabled, onToggle }: CardExcursionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
          : "border-camp-hairline bg-camp-white text-camp-charcoal hover:border-camp-charcoal",
      )}
    >
      <span className="text-xl">{excursion.emoji}</span>
      <span className="flex-1 font-mono text-xs font-bold tracking-[0.04em] uppercase">
        {excursion.name}
      </span>
      {selected ? <Check className="size-4 shrink-0 text-camp-gold" /> : null}
    </button>
  );
}
