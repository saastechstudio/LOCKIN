"use client";

import { useState, useTransition } from "react";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleTask, deleteTask } from "@/lib/actions/planning";
import type { PlanningTask } from "@/lib/db/schema";

const PRIORITY_BADGE: Record<PlanningTask["priority"], { label: string; variant: "outline" | "default" | "coral" }> = {
  low: { label: "Basse", variant: "outline" },
  medium: { label: "Moyenne", variant: "default" },
  high: { label: "Haute", variant: "coral" },
};

function groupTasks(tasks: PlanningTask[]) {
  const groups: Record<string, PlanningTask[]> = {
    "En retard": [],
    "Aujourd'hui": [],
    "Cette semaine": [],
    "Plus tard": [],
    "Sans échéance": [],
    Terminées: [],
  };

  for (const task of tasks) {
    if (task.completed) {
      groups.Terminées.push(task);
      continue;
    }
    if (!task.dueDate) {
      groups["Sans échéance"].push(task);
      continue;
    }
    const due = new Date(task.dueDate);
    if (isPast(due) && !isToday(due)) {
      groups["En retard"].push(task);
    } else if (isToday(due)) {
      groups["Aujourd'hui"].push(task);
    } else if (isThisWeek(due, { weekStartsOn: 1 }) || isTomorrow(due)) {
      groups["Cette semaine"].push(task);
    } else {
      groups["Plus tard"].push(task);
    }
  }

  return groups;
}

function TaskRow({ task }: { task: PlanningTask }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.completed);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-brand-card px-4 py-3 transition-opacity",
        isPending && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => {
          const next = !optimisticCompleted;
          setOptimisticCompleted(next);
          startTransition(async () => {
            await toggleTask(task.id, next);
          });
        }}
        aria-label={optimisticCompleted ? "Marquer comme à faire" : "Marquer comme terminée"}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          optimisticCompleted
            ? "border-brand-blue bg-brand-blue text-white"
            : "border-border text-transparent hover:border-brand-blue/50",
        )}
      >
        <Check className="size-3" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm text-foreground",
            optimisticCompleted && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="mt-0.5 text-xs text-muted-foreground">{task.notes}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(task.dueDate), "d MMM", { locale: fr })}
            </span>
          )}
          <Badge variant={PRIORITY_BADGE[task.priority].variant} className="text-[10px]">
            {PRIORITY_BADGE[task.priority].label}
          </Badge>
        </div>
      </div>

      <button
        type="button"
        onClick={() => startTransition(async () => deleteTask(task.id))}
        aria-label="Supprimer la tâche"
        className="text-muted-foreground/50 transition-colors hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function PlanningBoard({ tasks }: { tasks: PlanningTask[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        Aucune tâche pour l&apos;instant. Ajoute ta première action.
      </p>
    );
  }

  const groups = groupTasks(tasks);
  const order = [
    "En retard",
    "Aujourd'hui",
    "Cette semaine",
    "Plus tard",
    "Sans échéance",
    "Terminées",
  ];

  return (
    <div className="space-y-6">
      {order
        .filter((key) => groups[key].length > 0)
        .map((key) => (
          <div key={key}>
            <h3
              className={cn(
                "font-display mb-2 text-sm text-foreground",
                key === "En retard" && "text-destructive",
              )}
            >
              {key} <span className="text-muted-foreground">({groups[key].length})</span>
            </h3>
            <div className="space-y-2">
              {groups[key].map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
