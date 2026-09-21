"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Circle, Flame, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { updateTodayFocus } from "@/lib/actions/daily-focus";
import type { DailyFocus } from "@/lib/db/schema";

export function DailyCheckin({ focus }: { focus: DailyFocus }) {
  const [taskCompleted, setTaskCompleted] = useState(focus.taskCompleted);
  const [disciplineRating, setDisciplineRating] = useState(
    focus.disciplineRating ?? 5,
  );
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    formData.set("focusId", focus.id.toString());
    formData.set("taskCompleted", taskCompleted ? "on" : "off");
    formData.set("disciplineRating", disciplineRating.toString());
    startTransition(async () => {
      await updateTodayFocus(formData);
      setDone(true);
    });
  };

  return (
    <Card className="surface">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Flame className="size-4 text-brand-blue" />
        <CardTitle className="font-display text-xl">Check-in Quotidien</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="size-3.5 text-brand-blue-deep" />
              <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                Tâche du jour
              </Label>
            </div>
            <button
              type="button"
              onClick={() => setTaskCompleted((v) => !v)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                taskCompleted
                  ? "border-brand-blue/40 bg-brand-blue/10"
                  : "border-brand-border bg-secondary/30 hover:border-brand-blue/30",
              )}
            >
              {taskCompleted ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-blue" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  "text-sm",
                  taskCompleted
                    ? "text-foreground line-through decoration-brand-blue/60"
                    : "text-foreground",
                )}
              >
                {focus.taskDescription}
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                Discipline aujourd&apos;hui
              </Label>
              <span className="font-display text-lg text-brand-coral">
                {disciplineRating}/10
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDisciplineRating(n)}
                  aria-label={`Discipline ${n} sur 10`}
                  className={cn(
                    "h-8 flex-1 rounded-sm border transition-colors",
                    n <= disciplineRating
                      ? "border-brand-coral/50 bg-brand-coral/60 shadow-coral-glow"
                      : "border-brand-border bg-secondary/40 hover:border-brand-coral/30",
                  )}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Enregistrement..." : "Valider mon check-in"}
          </Button>

          {done && !isPending && (
            <p className="text-center text-xs text-brand-blue-deep">
              Check-in enregistré. Reste lock in.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
