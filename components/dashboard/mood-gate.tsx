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

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "motive", emoji: "🔥", label: "Motivé" },
  { value: "normal", emoji: "🙂", label: "Normal" },
  { value: "fatigue", emoji: "😐", label: "Fatigué" },
  { value: "stresse", emoji: "😔", label: "Stressé" },
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
                "flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-4 py-5 text-center transition hover:border-brand-blue/60 hover:bg-brand-blue/5 disabled:opacity-60",
                selecting === option.value && pending && "border-brand-blue/60 bg-brand-blue/5",
              )}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="text-sm font-medium text-foreground">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
