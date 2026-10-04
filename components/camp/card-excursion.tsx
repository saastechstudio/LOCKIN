import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Excursion } from "@/lib/camp/data";

type CardExcursionProps = {
  excursion: Excursion;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/** Bloc sélectionnable pour choisir une excursion (max 2 au total, imposé par le parent). */
export function CardExcursion({ excursion, selected, disabled, onToggle }: CardExcursionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 border-2 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-camp-charcoal bg-camp-charcoal text-camp-cream"
          : "border-camp-brown/30 bg-camp-cream text-camp-brown hover:border-camp-brown",
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
