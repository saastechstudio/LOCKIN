"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pause, Play, Square, Timer } from "lucide-react";

import { logFocusSession } from "@/lib/actions/life-os";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader, Ring } from "./ring";

const hours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
};

/**
 * Focus Score et temps productif. Le minuteur mesure une session de travail
 * profond (rattachée ou non à un objectif) ; à l'arrêt, elle est enregistrée
 * et nourrit le score, l'objectif et sa sphère.
 */
export function FocusPanel({
  focusScore,
  todayMinutes,
  weekMinutes,
  goals,
}: {
  focusScore: number;
  todayMinutes: number;
  weekMinutes: number;
  goals: { id: number; title: string }[];
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [goalId, setGoalId] = useState<number | "">("");
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef<number | null>(null);
  const accumulated = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (startedAt.current) setElapsed(accumulated.current + (Date.now() - startedAt.current) / 1000);
    }, 500);
    return () => window.clearInterval(timer);
  }, [running]);

  function toggle() {
    if (running) {
      accumulated.current += (Date.now() - (startedAt.current ?? Date.now())) / 1000;
      startedAt.current = null;
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setSaved(null);
      setRunning(true);
    }
  }

  function save(minutes: number) {
    if (minutes < 1) return;
    startTransition(async () => {
      const result = await logFocusSession({ minutes, goalId: goalId === "" ? null : goalId });
      setSaved(result.ok ? `${minutes} min enregistrées` : result.error);
    });
  }

  function stop() {
    const total = accumulated.current + (startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0);
    startedAt.current = null;
    accumulated.current = 0;
    setRunning(false);
    setElapsed(0);
    save(Math.round(total / 60));
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");

  return (
    <Panel>
      <PanelHeader eyebrow="Focus" title="Travail profond" />
      <div className="mt-5 flex items-center gap-5">
        <Ring value={focusScore} size={96} stroke={6} color="var(--lk-gold)">
          <div className="text-center">
            <p className="font-display text-2xl text-lk-black tabular-nums">{focusScore}</p>
            <p className="text-[9px] tracking-[0.2em] text-lk-stone-3 uppercase">Focus</p>
          </div>
        </Ring>
        <dl className="grid flex-1 grid-cols-2 gap-3">
          <div>
            <dt className="text-[10px] tracking-[0.2em] text-lk-stone-2 uppercase">Aujourd&apos;hui</dt>
            <dd className="font-display mt-1 text-xl text-lk-black tabular-nums">{hours(todayMinutes)}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.2em] text-lk-stone-2 uppercase">7 jours</dt>
            <dd className="font-display mt-1 text-xl text-lk-black tabular-nums">{hours(weekMinutes)}</dd>
          </div>
        </dl>
      </div>

      <div className={cn("mt-5 rounded-2xl border p-4 transition-all", running ? "border-lk-blue-soft/60 lk-glow-blue" : "border-lk-line bg-lk-surface")}>
        <div className="flex items-center justify-between gap-3">
          <p className={cn("font-display text-3xl tabular-nums", running ? "text-lk-black" : "text-lk-stone-3")}>
            {mm}:{ss}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={running ? "Mettre en pause" : "Démarrer une session"}
              className="flex size-10 items-center justify-center rounded-xl bg-lk-blue text-white transition-all hover:bg-lk-blue-soft hover:shadow-focus"
            >
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={elapsed < 60 || pending}
              aria-label="Terminer et enregistrer"
              className="flex size-10 items-center justify-center rounded-xl border border-lk-line text-lk-black transition-colors hover:bg-lk-surface disabled:opacity-30"
            >
              <Square className="size-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value ? Number(e.target.value) : "")}
            aria-label="Objectif de la session"
            className="lockin-input w-auto max-w-full flex-1 rounded-lg py-1.5 text-xs"
          >
            <option value="">Sans objectif</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {[25, 50].map((m) => (
            <button
              key={m}
              type="button"
              disabled={pending}
              onClick={() => save(m)}
              className="inline-flex items-center gap-1 rounded-lg border border-lk-line px-2.5 py-1.5 text-xs text-lk-stone-3 hover:text-lk-black"
            >
              <Timer className="size-3" /> +{m} min
            </button>
          ))}
        </div>
        {saved ? <p className="mt-2 text-xs text-lk-gold">{saved}</p> : null}
      </div>
    </Panel>
  );
}
