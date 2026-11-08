"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { createLifeGoal, planGoalWithCopilot } from "@/lib/actions/life-os";
import { cn } from "@/lib/utils";

const HORIZONS = [
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
  { days: 180, label: "6 mois" },
  { days: 365, label: "1 an" },
  { days: null, label: "Sans échéance" },
] as const;

/**
 * Créer un objectif comme on parle à son copilote : une phrase, puis, si on
 * veut, la vision, l'échéance et la sphère. Le copilote peut aussitôt le
 * découper en jalons et en tâches.
 */
export function GoalComposer({
  spheres,
  defaultSphereId,
}: {
  spheres: { id: number; name: string; color: string }[];
  defaultSphereId?: number;
}) {
  const [title, setTitle] = useState("");
  const [vision, setVision] = useState("");
  const [horizon, setHorizon] = useState<number | null>(90);
  const [sphereId, setSphereId] = useState<number | null>(defaultSphereId ?? spheres[0]?.id ?? null);
  const [withCopilot, setWithCopilot] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const open = title.trim().length > 0;

  function submit() {
    setStatus(null);
    startTransition(async () => {
      const created = await createLifeGoal({
        title,
        vision: vision || undefined,
        horizonDays: horizon,
        sphereId,
        category: "personal",
      });
      if (!created.ok) return setStatus(created.error);
      setTitle("");
      setVision("");
      if (withCopilot) {
        setStatus("Le copilote découpe ton objectif…");
        const plan = await planGoalWithCopilot(created.data.id);
        setStatus(plan.ok ? `Objectif verrouillé : ${plan.data.milestones} jalons posés par le copilote.` : `Objectif créé. ${plan.error}`);
      } else {
        setStatus("Objectif verrouillé.");
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (open) submit();
      }}
      className={cn("lk-glass lk-edge rounded-3xl p-2 transition-all duration-500", open && "lk-glow-blue")}
    >
      <div className="flex items-center gap-3 px-3">
        <Sparkles className="size-5 shrink-0 text-lk-blue-soft" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quel objectif veux-tu verrouiller ?"
          aria-label="Titre de l'objectif"
          maxLength={140}
          className="font-display h-14 min-w-0 flex-1 bg-transparent text-lg text-lk-black outline-none placeholder:text-lk-stone-2 sm:text-xl"
        />
        <button
          type="submit"
          disabled={!open || pending}
          aria-label="Créer l'objectif"
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lk-blue text-white transition-all hover:bg-lk-blue-soft hover:shadow-focus disabled:opacity-30"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-500 ease-premium",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-lk-line px-4 pt-4 pb-3">
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="Ta vision : à quoi ressemble « c'est fait » ? (facultatif, le copilote peut l'écrire)"
              aria-label="Vision finale"
              rows={2}
              maxLength={600}
              className="lockin-input resize-none rounded-xl"
            />
            <Chips label="Échéance">
              {HORIZONS.map((h) => (
                <Chip key={h.label} active={horizon === h.days} onClick={() => setHorizon(h.days)}>
                  {h.label}
                </Chip>
              ))}
            </Chips>
            {spheres.length > 0 ? (
              <Chips label="Sphère">
                {spheres.map((s) => (
                  <Chip key={s.id} active={sphereId === s.id} onClick={() => setSphereId(s.id)}>
                    <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </Chip>
                ))}
              </Chips>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-lk-stone-3">
              <input
                type="checkbox"
                checked={withCopilot}
                onChange={(e) => setWithCopilot(e.target.checked)}
                className="size-4 accent-[#E04B5F]"
              />
              Laisser le copilote poser la vision, les jalons et les tâches
            </label>
          </div>
        </div>
      </div>
      {status ? <p className="px-4 pb-3 text-sm text-lk-gold" role="status">{status}</p> : null}
    </form>
  );
}

function Chips({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-2 uppercase">{label}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-all",
        active ? "border-lk-blue-soft bg-lk-blue/30 text-lk-black" : "border-lk-line text-lk-stone-3 hover:text-lk-black",
      )}
    >
      {children}
    </button>
  );
}
