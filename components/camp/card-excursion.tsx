import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Excursion } from "@/lib/camp/data";

type CardExcursionProps = {
  excursion: Excursion;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
};

/** Carte sélectionnable pour choisir une excursion (max 2 au total, imposé par le parent). */
export function CardExcursion({ excursion, selected, disabled, onToggle }: CardExcursionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-camp-brown bg-camp-brown text-camp-cream shadow-soft"
          : "border-camp-border bg-camp-card text-camp-brown-deep hover:border-camp-brown/40",
      )}
    >
      <span className="text-xl">{excursion.emoji}</span>
      <span className="flex-1 text-sm font-medium">{excursion.name}</span>
      {selected ? <Check className="size-4 shrink-0" /> : null}
    </button>
  );
}
