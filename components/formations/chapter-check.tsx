"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { toggleChapterDone } from "@/lib/actions/formations";

/** Coche rectangulaire : pleine noire = chapitre terminé. Pas d'animation, pas de confettis. */
export function ChapterCheck({ chapterId, done, disabled }: { chapterId: number; done: boolean; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="shrink-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? "Marquer ce chapitre comme non terminé" : "Marquer ce chapitre comme terminé"}
        disabled={disabled || isPending}
        title={disabled ? "Commence la formation pour suivre ta progression" : undefined}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await toggleChapterDone(chapterId);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Action impossible.");
            }
          });
        }}
        className={cn(
          "flex size-6 items-center justify-center border border-lk-line transition-colors disabled:opacity-40",
          done ? "bg-lk-black text-lk-white" : "bg-lk-white text-transparent hover:bg-lk-mist",
        )}
      >
        <Check className="size-4" />
      </button>
      {error ? <p className="sr-only" role="alert">{error}</p> : null}
    </div>
  );
}
