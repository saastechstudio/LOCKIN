"use client";

import { useState, useTransition } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setTodayMood, type Mood } from "@/lib/actions/daily-focus";
import { cn } from "@/lib/utils";

/** Pas d'emoji : une jauge de quatre barres verticales indique l'énergie. */
const MOOD_OPTIONS: { value: Mood; energy: number; label: string }[] = [
  { value: "motive", energy: 4, label: "Motivé" },
  { value: "normal", energy: 3, label: "Normal" },
  { value: "fatigue", energy: 2, label: "Fatigué" },
  { value: "stresse", energy: 1, label: "Stressé" },
];

/**
 * Modal obligatoire affiché tant que l'humeur du jour n'est pas choisie.
 * Pas de bouton fermer, pas de fermeture au clic extérieur ou à l'échappe :
 * le choix conditionne le ton du Coach IA pour le reste de la journée.
 */
export function MoodGate({
  focusId,
  initialMood,
}: {
  focusId: number;
  initialMood: Mood | null;
}) {
  const [mood, setMood] = useState<Mood | null>(initialMood);
  const [pending, startTransition] = useTransition();
  const [selecting, setSelecting] = useState<Mood | null>(null);

  function choose(value: Mood) {
    setSelecting(value);
    startTransition(async () => {
      await setTodayMood(focusId, value);
      setMood(value);
    });
  }

  return (
    <Dialog open={mood === null}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Ton humeur du jour</DialogTitle>
          <DialogDescription>
            Dis nous comment tu te sens. Ton Coach IA adapte son ton en
            fonction, pour t&apos;aider à rester lock in sans te forcer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={pending}
              onClick={() => choose(option.value)}
              className={cn(
                "flex flex-col items-center gap-3 border border-lk-line bg-lk-white px-4 py-5 text-center transition-colors hover:border-lk-line disabled:opacity-60",
                selecting === option.value && pending && "border-lk-line bg-lk-mist",
              )}
            >
              <span className="flex h-8 items-end gap-1" aria-hidden>
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={cn("w-2", bar <= option.energy ? "bg-lk-black" : "bg-lk-line")}
                    style={{ height: `${bar * 25}%` }}
                  />
                ))}
              </span>
              <span className="text-sm font-medium text-lk-black">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
