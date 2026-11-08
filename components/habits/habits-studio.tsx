"use client";

import { useState, useTransition } from "react";
import { Archive, Flame, Plus } from "lucide-react";

import { habitTone } from "@/components/cockpit/habit-icon";
import { HabitsToday } from "@/components/cockpit/habits-today";
import type { ActionResult } from "@/lib/action-result";
import { archiveHabit, createHabit, createHabitFromPreset, setHabitSphere } from "@/lib/actions/life-os";
import { HABIT_CATEGORIES, HABIT_PRESETS, formatValue } from "@/lib/life-os/habits";
import type { HabitView } from "@/lib/life-os/snapshot";
import type { HabitCategory } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.keys(HABIT_CATEGORIES) as HabitCategory[];

/**
 * Studio d'habitudes : activer un domaine d'un geste, créer sur mesure,
 * noter le jour, lire ses tendances sur 14 jours, relier chaque habitude
 * à une sphère de vie.
 */
export function HabitsStudio({
  habits,
  spheres,
}: {
  habits: HabitView[];
  spheres: { id: number; name: string; color: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState<{ category: HabitCategory; label: string; target: string; unit: string } | null>(null);

  function run(task: () => Promise<ActionResult<unknown>>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error);
    });
  }

  const activeCategories = new Set(habits.map((h) => h.category));

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const tone = habitTone(category);
          const presetIndex = HABIT_PRESETS.findIndex((p) => p.category === category);
          const preset = HABIT_PRESETS[presetIndex];
          const active = activeCategories.has(category);
          return (
            <div
              key={category}
              className={cn(
                "lk-glass group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5",
                active && "lk-glow-gold",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70"
                style={{ background: tone.hex }}
              />
              <span className={cn("flex size-11 items-center justify-center rounded-2xl", tone.bg, tone.text)}>
                <tone.Icon className="size-5" />
              </span>
              <p className="font-display mt-4 text-lg text-lk-black">{tone.label}</p>
              <p className="mt-0.5 text-xs text-lk-stone-3">
                {active
                  ? `${habits.filter((h) => h.category === category).length} habitude(s) suivie(s)`
                  : preset.label}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => createHabitFromPreset(presetIndex))}
                  className="rounded-xl bg-lk-blue px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-lk-blue-soft hover:shadow-focus disabled:opacity-50"
                >
                  {active ? "Ajouter le classique" : "Activer"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustom({ category, label: "", target: String(preset.target), unit: preset.unit })}
                  className="rounded-xl border border-lk-line px-3 py-1.5 text-xs text-lk-stone-3 hover:text-lk-black"
                >
                  Sur mesure
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {custom ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() =>
              createHabit({
                category: custom.category,
                label: custom.label,
                target: Number(custom.target.replace(",", ".")),
                unit: custom.unit,
              }),
            );
            setCustom(null);
          }}
          className="lk-glass lk-glow-blue animate-fade-up flex flex-wrap items-end gap-3 rounded-3xl p-5"
        >
          <label className="min-w-48 flex-1 text-xs text-lk-stone-3">
            Habitude · {habitTone(custom.category).label}
            <input
              autoFocus
              value={custom.label}
              onChange={(e) => setCustom({ ...custom, label: e.target.value })}
              placeholder="Ex. Courir avant 8 h"
              className="lockin-input mt-1.5 rounded-xl"
              maxLength={80}
            />
          </label>
          <label className="w-28 text-xs text-lk-stone-3">
            Cible / jour
            <input
              inputMode="decimal"
              value={custom.target}
              onChange={(e) => setCustom({ ...custom, target: e.target.value })}
              className="lockin-input mt-1.5 rounded-xl"
            />
          </label>
          <label className="w-28 text-xs text-lk-stone-3">
            Unité
            <input
              value={custom.unit}
              onChange={(e) => setCustom({ ...custom, unit: e.target.value })}
              className="lockin-input mt-1.5 rounded-xl"
              maxLength={20}
            />
          </label>
          <button type="submit" disabled={pending || custom.label.trim().length < 2} className="lockin-button h-[46px] rounded-xl">
            <Plus className="size-4" /> Créer
          </button>
          <button type="button" onClick={() => setCustom(null)} className="h-[46px] px-2 text-sm text-lk-stone-3 hover:text-lk-black">
            Annuler
          </button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-4 py-2 text-sm text-lk-coral">
          {error}
        </p>
      ) : null}

      <HabitsToday habits={habits} />

      {habits.length > 0 ? (
        <section className="lk-glass rounded-3xl p-5 sm:p-6">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Tendances · 14 jours</p>
          <ul className="mt-4 divide-y divide-lk-line">
            {habits.map((h) => {
              const tone = habitTone(h.category);
              return (
                <li key={h.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-44 flex-1">
                    <p className="text-sm text-lk-black">{h.label}</p>
                    <p className="text-xs text-lk-stone-3">
                      Cible {formatValue(h.target, h.unit)} · réussite {h.success14} %
                      {h.streak > 0 ? (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-lk-gold">
                          <Flame className="size-3" /> {h.streak} j
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex gap-1" role="img" aria-label={`Historique de ${h.label} sur 14 jours`}>
                    {h.last14.map((v, i) => {
                      const ratio = v === null ? 0 : Math.min(1, v / h.target);
                      return (
                        <span
                          key={i}
                          title={v === null ? "Non noté" : formatValue(v, h.unit)}
                          className="size-4 rounded-[5px] border border-lk-line"
                          style={{
                            background: v === null ? "transparent" : tone.hex,
                            opacity: v === null ? 1 : 0.25 + ratio * 0.75,
                            boxShadow: ratio >= 1 ? `0 0 8px ${tone.hex}` : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                  <select
                    value={h.sphereId ?? ""}
                    onChange={(e) => run(() => setHabitSphere(h.id, e.target.value ? Number(e.target.value) : null))}
                    aria-label={`Sphère de ${h.label}`}
                    className="lockin-input w-auto rounded-lg py-1.5 text-xs"
                  >
                    <option value="">Sans sphère</option>
                    {spheres.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => archiveHabit(h.id))}
                    aria-label={`Archiver ${h.label}`}
                    title="Archiver"
                    className="rounded-lg p-2 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black"
                  >
                    <Archive className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
