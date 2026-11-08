"use client";

import { useState, useTransition } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Flag,
  Info,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Ring } from "@/components/cockpit/ring";
import type { ActionResult } from "@/lib/action-result";
import { deleteGoal, shareGoalToFeed } from "@/lib/actions/goals";
import {
  addGoalTask,
  addMilestone,
  deleteGoalTask,
  planGoalWithCopilot,
  toggleGoalTask,
  toggleMilestone,
  updateLifeGoal,
} from "@/lib/actions/life-os";
import { PACE_LABELS } from "@/lib/life-os/goals";
import type { GoalView } from "@/lib/life-os/snapshot";
import { cn } from "@/lib/utils";

/** Les anciennes actions d'objectifs lèvent leurs erreurs : on les ramène à un résultat affichable. */
async function settle(task: () => Promise<unknown>): Promise<ActionResult<null>> {
  try {
    await task();
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "Action impossible pour le moment." };
  }
}

const hours = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`);

/**
 * Un objectif vivant : vision, jalons, tâches, temps investi, progression
 * calculée, difficultés détectées. Le copilote peut le découper ou le
 * prolonger à tout moment.
 */
export function LivingGoal({
  goal,
  spheres,
  canShare = false,
  defaultOpen = false,
}: {
  goal: GoalView;
  spheres: { id: number; name: string; color: string }[];
  /** Le partage au feed est réservé aux membres du club. */
  canShare?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editingVision, setEditingVision] = useState(false);
  const sphere = spheres.find((s) => s.id === goal.sphereId);
  const color = sphere?.color ?? "#E04B5F";
  const looseTasks = goal.tasks.filter((t) => t.milestoneId === null);

  function run(task: () => Promise<ActionResult<unknown>>, success?: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await task();
      setMessage(result.ok ? (success ?? null) : result.error);
    });
  }

  return (
    <article
      id={`goal-${goal.id}`}
      className={cn("lk-glass lk-edge scroll-mt-24 rounded-3xl transition-all duration-500", open && "lk-glow-blue")}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
      >
        <Ring value={goal.progress} size={64} stroke={5} color={color}>
          <span className="font-display text-sm text-lk-black tabular-nums">{goal.progress}%</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {sphere ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-lk-stone-3 uppercase">
                <span className="size-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                {sphere.name}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                goal.pace === "behind" ? "bg-lk-coral/15 text-lk-coral" : goal.pace === "ahead" ? "bg-lk-gold/15 text-lk-gold" : "bg-lk-surface text-lk-stone-3",
              )}
            >
              {PACE_LABELS[goal.pace]}
            </span>
          </div>
          <h3 className="font-display mt-1 truncate text-xl text-lk-black">{goal.title}</h3>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-lk-stone-3">
            <span className="inline-flex items-center gap-1">
              <Flag className="size-3" />
              {goal.milestones.filter((m) => m.done).length}/{goal.milestones.length} jalons
            </span>
            <span className="inline-flex items-center gap-1">
              <Check className="size-3" />
              {goal.tasks.filter((t) => t.done).length}/{goal.tasks.length} tâches
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {hours(goal.minutesInvested)} investies
            </span>
            {goal.daysLeft !== null ? (
              <span className={goal.daysLeft < 0 ? "text-lk-coral" : undefined}>
                {goal.daysLeft >= 0 ? `${goal.daysLeft} j restants` : `échéance dépassée de ${-goal.daysLeft} j`}
              </span>
            ) : null}
          </p>
        </div>
        <ChevronDown className={cn("size-5 shrink-0 text-lk-stone-3 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <div className={cn("grid transition-all duration-500 ease-premium", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-lk-line px-5 py-5 sm:px-6">
            <section>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Vision finale</p>
              {editingVision ? (
                <textarea
                  autoFocus
                  defaultValue={goal.vision ?? ""}
                  rows={3}
                  maxLength={600}
                  aria-label="Vision finale"
                  onBlur={(e) => {
                    setEditingVision(false);
                    if (e.target.value !== (goal.vision ?? "")) run(() => updateLifeGoal(goal.id, { vision: e.target.value }));
                  }}
                  className="lockin-input mt-2 resize-none rounded-xl"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingVision(true)}
                  className="mt-2 w-full rounded-xl border border-transparent p-2 -m-2 text-left text-sm leading-relaxed text-lk-black hover:border-lk-line"
                >
                  {goal.vision ?? <span className="text-lk-stone-2">Décris ce que tu verras quand ce sera fait…</span>}
                </button>
              )}
            </section>

            {goal.difficulties.length > 0 ? (
              <section>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Difficultés détectées</p>
                <ul className="mt-2 space-y-1.5">
                  {goal.difficulties.map((d) => {
                    const Icon = d.tone === "critical" ? AlertOctagon : d.tone === "warning" ? AlertTriangle : Info;
                    return (
                      <li key={d.id} className="flex gap-2 text-sm text-lk-black">
                        <Icon className={cn("mt-0.5 size-4 shrink-0", d.tone === "critical" ? "text-lk-coral" : d.tone === "warning" ? "text-lk-gold" : "text-lk-blue-soft")} />
                        {d.detail}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Jalons et tâches</p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => planGoalWithCopilot(goal.id), "Le copilote a posé de nouveaux jalons.")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-lk-blue-soft/50 bg-lk-blue/20 px-3 py-1.5 text-xs font-medium text-lk-black transition-all hover:shadow-focus disabled:opacity-50"
                >
                  <Sparkles className={cn("size-3.5 text-lk-blue-soft", pending && "animate-spin")} />
                  {goal.milestones.length === 0 ? "Découper avec le copilote" : "Prolonger avec le copilote"}
                </button>
              </div>

              <ol className="mt-3 space-y-3">
                {goal.milestones.map((m, index) => (
                  <li key={m.id} className="rounded-2xl border border-lk-line bg-lk-surface p-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={m.done ? `Rouvrir le jalon ${m.title}` : `Valider le jalon ${m.title}`}
                        onClick={() => run(() => toggleMilestone(m.id))}
                        className={cn(
                          "font-display flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs transition-all",
                          m.done ? "border-lk-gold bg-lk-gold text-lk-white shadow-gold" : "border-lk-line text-lk-stone-3 hover:border-lk-gold",
                        )}
                      >
                        {m.done ? <Check className="size-3.5" /> : index + 1}
                      </button>
                      <p className={cn("text-sm font-medium", m.done ? "text-lk-stone-3 line-through" : "text-lk-black")}>{m.title}</p>
                    </div>
                    <TaskList
                      tasks={goal.tasks.filter((t) => t.milestoneId === m.id)}
                      pending={pending}
                      onToggle={(id) => run(() => toggleGoalTask(id))}
                      onDelete={(id) => run(() => deleteGoalTask(id))}
                    />
                    <InlineAdd placeholder="Ajouter une tâche" onAdd={(title) => run(() => addGoalTask(goal.id, { title, milestoneId: m.id }))} />
                  </li>
                ))}
              </ol>

              {looseTasks.length > 0 ? (
                <div className="mt-3 rounded-2xl border border-lk-line p-3">
                  <p className="text-xs text-lk-stone-3">Tâches libres</p>
                  <TaskList
                    tasks={looseTasks}
                    pending={pending}
                    onToggle={(id) => run(() => toggleGoalTask(id))}
                    onDelete={(id) => run(() => deleteGoalTask(id))}
                  />
                </div>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <InlineAdd placeholder="Nouveau jalon" onAdd={(title) => run(() => addMilestone(goal.id, title))} />
                <InlineAdd placeholder="Tâche libre" onAdd={(title) => run(() => addGoalTask(goal.id, { title }))} />
              </div>
            </section>

            <section className="flex flex-wrap items-center justify-between gap-3 border-t border-lk-line pt-4">
              <label className="flex items-center gap-2 text-xs text-lk-stone-3">
                Sphère
                <select
                  value={goal.sphereId ?? ""}
                  onChange={(e) => run(() => updateLifeGoal(goal.id, { sphereId: e.target.value ? Number(e.target.value) : null }))}
                  className="lockin-input w-auto rounded-lg py-1 text-xs"
                >
                  <option value="">Aucune</option>
                  {spheres.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                {canShare ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => settle(() => shareGoalToFeed(goal.id)), "Partagé dans le feed du club.")
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black"
                >
                  <Share2 className="size-3.5" /> Partager au club
                </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm(`Supprimer « ${goal.title} » et tout son contenu ?`)) return;
                    run(() => settle(() => deleteGoal(goal.id)));
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-lk-stone-3 hover:bg-lk-coral/10 hover:text-lk-coral"
                >
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </section>
            {message ? (
              <p role="status" className="text-sm text-lk-gold">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function TaskList({
  tasks,
  pending,
  onToggle,
  onDelete,
}: {
  tasks: GoalView["tasks"];
  pending: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (tasks.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 pl-10">
      {tasks.map((t) => (
        <li key={t.id} className="group flex items-center gap-2.5">
          <button
            type="button"
            disabled={pending}
            onClick={() => onToggle(t.id)}
            aria-label={t.done ? `Rouvrir ${t.title}` : `Terminer ${t.title}`}
            className={cn(
              "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-all",
              t.done ? "border-lk-blue-soft bg-lk-blue-soft text-white" : "border-lk-stone-2 hover:border-lk-blue-soft",
            )}
          >
            {t.done ? <Check className="size-3" /> : null}
          </button>
          <span className={cn("flex-1 text-sm", t.done ? "text-lk-stone-2 line-through" : "text-lk-black")}>{t.title}</span>
          <button
            type="button"
            onClick={() => onDelete(t.id)}
            aria-label={`Supprimer ${t.title}`}
            className="rounded p-1 text-lk-stone-2 opacity-0 transition-opacity group-hover:opacity-100 hover:text-lk-coral focus-visible:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function InlineAdd({ placeholder, onAdd }: { placeholder: string; onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length < 2) return;
        onAdd(value.trim());
        setValue("");
      }}
      className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-lk-line px-3 focus-within:border-lk-blue-soft"
    >
      <Plus className="size-3.5 shrink-0 text-lk-stone-2" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={140}
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-lk-black outline-none placeholder:text-lk-stone-2"
      />
    </form>
  );
}
