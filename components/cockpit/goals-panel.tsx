import Link from "next/link";
import { ArrowUpRight, Target } from "lucide-react";

import { PACE_LABELS } from "@/lib/life-os/goals";
import type { GoalView, SphereView } from "@/lib/life-os/snapshot";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader, Ring } from "./ring";

/** Objectifs actifs : anneau de progression, rythme, prochaine action. */
export function GoalsPanel({ goals, spheres }: { goals: GoalView[]; spheres: SphereView[] }) {
  const active = goals.filter((g) => g.progress < 100).slice(0, 4);
  const color = (id: number | null) => spheres.find((s) => s.id === id)?.color ?? "#E04B5F";

  return (
    <Panel>
      <PanelHeader
        eyebrow="Objectifs actifs"
        title={`${goals.filter((g) => g.progress < 100).length} en cours`}
        action={
          <Link href="/dashboard/objectifs" className="inline-flex items-center gap-1 text-xs text-lk-stone-3 hover:text-lk-black">
            Tout voir <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />
      {active.length === 0 ? (
        <Link
          href="/dashboard/objectifs"
          className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed border-lk-line p-5 transition-colors hover:border-lk-blue-soft"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-lk-blue/30 text-lk-blue-soft">
            <Target className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-lk-black">Verrouille ton premier objectif</span>
            <span className="block text-xs text-lk-stone-3">Le copilote le découpe en jalons et en tâches.</span>
          </span>
        </Link>
      ) : (
        <ul className="mt-5 space-y-3">
          {active.map((g) => (
            <li key={g.id}>
              <Link
                href={`/dashboard/objectifs#goal-${g.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-transparent p-2 -m-2 transition-colors hover:border-lk-line hover:bg-lk-surface"
              >
                <Ring value={g.progress} size={52} stroke={4} color={color(g.sphereId)}>
                  <span className="text-xs font-medium text-lk-black tabular-nums">{g.progress}</span>
                </Ring>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-lk-black">{g.title}</p>
                  <p className="truncate text-xs text-lk-stone-3">
                    {g.nextTask ? `→ ${g.nextTask}` : "Aucune prochaine action"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    g.pace === "behind"
                      ? "bg-lk-coral/15 text-lk-coral"
                      : g.pace === "ahead"
                        ? "bg-lk-gold/15 text-lk-gold"
                        : "bg-lk-surface text-lk-stone-3",
                  )}
                >
                  {PACE_LABELS[g.pace]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
