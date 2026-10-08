"use client";

import { useState, useTransition } from "react";
import { Share2, Trash2 } from "lucide-react";

import {
  createGoal,
  deleteGoal,
  shareGoalToFeed,
  updateGoalProgress,
} from "@/lib/actions/goals";
import type { Goal } from "@/lib/db/schema";

const HORIZONS = [30, 60, 90] as const;

type GoalsBoardProps = {
  goals: Goal[];
};

/** Module Objectifs — personnel/pro, horizon 30/60/90j, progression, partage optionnel dans le feed. */
export function GoalsBoard({ goals }: GoalsBoardProps) {
  const personal = goals.filter((g) => g.category === "personal");
  const professional = goals.filter((g) => g.category === "professional");

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
      <GoalColumn title="Objectifs personnels" category="personal" goals={personal} />
      <GoalColumn title="Objectifs professionnels" category="professional" goals={professional} />
    </div>
  );
}

function GoalColumn({
  title,
  category,
  goals,
}: {
  title: string;
  category: "personal" | "professional";
  goals: Goal[];
}) {
  const [title_, setTitle] = useState("");
  const [horizon, setHorizon] = useState<number | "">("");
  const [isPublic, setIsPublic] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    const value = title_.trim();
    if (!value) return;
    startTransition(async () => {
      await createGoal({
        category,
        title: value,
        horizonDays: horizon === "" ? undefined : horizon,
        isPublic,
      });
      setTitle("");
      setHorizon("");
      setIsPublic(false);
    });
  }

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-camp-gold uppercase">
        {title}
      </p>

      <div className="space-y-4">
        {goals.map((goal) => (
          <GoalRow key={goal.id} goal={goal} />
        ))}
        {goals.length === 0 ? (
          <p className="text-sm text-camp-charcoal/40">Aucun objectif pour l&apos;instant.</p>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 border-t border-camp-hairline pt-4">
        <input
          value={title_}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nouvel objectif"
          className="w-full border border-camp-hairline bg-camp-white px-3 py-2 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-lk-line"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value ? Number(e.target.value) : "")}
            className="border border-camp-hairline bg-camp-white px-2.5 py-1.5 text-[11px] font-bold text-camp-charcoal uppercase outline-none"
          >
            <option value="">Horizon</option>
            {HORIZONS.map((h) => (
              <option key={h} value={h}>
                {h} jours
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-lk-stone-3 uppercase">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-camp-charcoal"
            />
            Public
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !title_.trim()}
            className="ml-auto border border-lk-line bg-camp-gold px-4 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-camp-charcoal uppercase disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();

  function setProgress(value: number) {
    startTransition(() => updateGoalProgress(goal.id, value));
  }

  return (
    <div className="border-b border-camp-hairline pb-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-camp-charcoal">{goal.title}</p>
          {goal.horizonDays ? (
            <p className="text-[10px] text-camp-charcoal/40 uppercase">
              {goal.horizonDays} jours {goal.isPublic ? "· public" : ""}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => startTransition(() => shareGoalToFeed(goal.id))}
            disabled={isPending}
            title="Partager dans le feed"
            className="text-camp-charcoal/40 hover:text-camp-gold"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => startTransition(() => deleteGoal(goal.id))}
            disabled={isPending}
            title="Supprimer"
            className="text-camp-charcoal/40 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 border border-camp-hairline bg-camp-white">
          <div className="h-full bg-camp-gold" style={{ width: `${goal.progress}%` }} />
        </div>
        <input
          type="number"
          min={0}
          max={100}
          value={goal.progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-14 border border-camp-hairline bg-camp-white px-1.5 py-0.5 text-right text-xs text-camp-charcoal outline-none"
        />
        <span className="text-xs text-lk-stone-3">%</span>
      </div>
    </div>
  );
}
