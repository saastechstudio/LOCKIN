import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SportActivity } from "@/lib/camp/data";

type CardActivityProps = {
  activity: SportActivity;
  selected: boolean;
  onSelect: () => void;
};

/** Bloc sélectionnable pour choisir l'activité sportive du jour (football, boxe thaï, padel, yoga). */
export function CardActivity({ activity, selected, onSelect }: CardActivityProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 border-2 px-4 py-5 text-center transition-colors",
        selected
          ? "border-camp-charcoal bg-camp-charcoal text-camp-cream"
          : "border-camp-brown/30 bg-camp-cream text-camp-brown hover:border-camp-brown",
      )}
    >
      <span className="text-2xl">{activity.emoji}</span>
      <span className="font-mono text-xs font-bold tracking-[0.08em] uppercase">
        {activity.name}
      </span>
      {selected ? <Check className="size-4 text-camp-gold" /> : null}
    </button>
  );
}
