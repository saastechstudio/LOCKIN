import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SportActivity } from "@/lib/camp/data";

type CardActivityProps = {
  activity: SportActivity;
  selected: boolean;
  onSelect: () => void;
};

/** Carte sélectionnable pour choisir l'activité sportive du jour (football, boxe thaï, padel, yoga). */
export function CardActivity({ activity, selected, onSelect }: CardActivityProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-5 text-center transition-all",
        selected
          ? "border-camp-brown bg-camp-brown text-camp-cream shadow-soft"
          : "border-camp-border bg-camp-card text-camp-brown-deep hover:border-camp-brown/40",
      )}
    >
      <span className="text-2xl">{activity.emoji}</span>
      <span className="text-sm font-medium">{activity.name}</span>
      {selected ? <Check className="size-4" /> : null}
    </button>
  );
}
