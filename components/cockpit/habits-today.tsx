"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ArrowUpRight, Check, Flame, Minus, Plus } from "lucide-react";

import { logHabit } from "@/lib/actions/life-os";
import { formatValue, stepFor } from "@/lib/life-os/habits";
import type { HabitView } from "@/lib/life-os/snapshot";
import { cn } from "@/lib/utils";
import { habitTone } from "./habit-icon";
import { Panel, PanelHeader } from "./ring";

/** Habitudes du jour : un geste pour noter, la jauge se remplit, la série s'allonge. */
export function HabitsToday({ habits, compact = false }: { habits: HabitView[]; compact?: boolean }) {
  const [, startTransition] = useTransition();
  const [values, setValue] = useOptimistic(
    Object.fromEntries(habits.map((h) => [h.id, h.todayValue])) as Record<number, number>,
    (state, update: { id: number; value: number }) => ({ ...state, [update.id]: update.value }),
  );
  const done = habits.filter((h) => (values[h.id] ?? 0) >= h.target).length;

  function set(habit: HabitView, value: number) {
    const next = Math.max(0, Math.round(value * 100) / 100);
    startTransition(async () => {
      setValue({ id: habit.id, value: next });
      await logHabit(habit.id, next);
    });
  }

  return (
    <Panel>
      <PanelHeader
        eyebrow="Habitudes"
        title={habits.length === 0 ? "Aucune habitude" : `${done}/${habits.length} tenues aujourd'hui`}
        action={
          <Link href="/dashboard/habitudes" className="inline-flex items-center gap-1 text-xs text-lk-stone-3 hover:text-lk-black">
            Gérer <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />
      {habits.length === 0 ? (
        <Link
          href="/dashboard/habitudes"
          className="mt-5 block rounded-2xl border border-dashed border-lk-line p-5 text-sm text-lk-stone-3 transition-colors hover:border-lk-blue-soft hover:text-lk-black"
        >
          Sommeil, sport, lecture, méditation, travail, nutrition : active tes premières habitudes en un geste.
        </Link>
      ) : (
        <ul className={cn("mt-5 grid gap-3", !compact && "sm:grid-cols-2")}>
          {habits.map((h) => {
            const value = values[h.id] ?? 0;
            const met = value >= h.target;
            const tone = habitTone(h.category);
            const step = stepFor(h.unit, h.target);
            return (
              <li
                key={h.id}
                className={cn(
                  "rounded-2xl border p-3 transition-all duration-300",
                  met ? "border-lk-gold/40 bg-lk-gold/[0.07]" : "border-lk-line bg-lk-surface",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tone.bg, tone.text)}>
                    {met ? <Check className="size-4" /> : <tone.Icon className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-lk-black">{h.label}</p>
                    <p className="text-[11px] text-lk-stone-3 tabular-nums">
                      {formatValue(value, h.unit)} / {formatValue(h.target, h.unit)}
                      {h.streak > 0 ? (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-lk-gold">
                          <Flame className="size-3" />
                          {h.streak}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Retirer ${step} ${h.unit}`}
                      onClick={() => set(h, value - step)}
                      disabled={value <= 0}
                      className="rounded-lg p-1.5 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black disabled:opacity-30"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Ajouter ${step} ${h.unit}`}
                      onClick={() => set(h, value + step)}
                      className="rounded-lg p-1.5 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black"
                    >
                      <Plus className="size-3.5" />
                    </button>
                    {!met ? (
                      <button
                        type="button"
                        onClick={() => set(h, h.target)}
                        className="ml-1 rounded-lg bg-lk-blue px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-lk-blue-soft"
                      >
                        Fait
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-lk-white/40">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-premium"
                    style={{
                      width: `${Math.min(100, (value / h.target) * 100)}%`,
                      background: met ? "var(--lk-gold)" : tone.hex,
                      boxShadow: `0 0 10px ${met ? "rgba(255, 233, 236,0.8)" : tone.hex}`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
