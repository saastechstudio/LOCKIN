import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getGoals, getRoutineItems } from "@/lib/actions/goals";
import { getProgression } from "@/lib/actions/progression";
import { LEVEL_MAX, levelName } from "@/lib/lockin-level";
import { LockIcon } from "@/components/lockin/lock-icon";
import { Stat } from "@/components/lockin/primitives";
import { GoalsBoard } from "@/components/social/goals-board";
import { RoutineBoard } from "@/components/social/routine-board";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  await requireLockinOnboarded();
  const [goals, routine, progression] = await Promise.all([
    getGoals(),
    getRoutineItems(),
    getProgression(),
  ]);

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl space-y-12">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Lockin Social Club
          </p>
          <h1 className="font-display text-3xl text-lk-black sm:text-4xl">
            Objectifs
          </h1>
          <p className="mt-1 text-sm text-lk-stone-3">
            Objectifs à 30, 60 ou 90 jours, et les routines qui les font tenir.
          </p>
        </div>

        {/* Score de discipline : la note quotidienne, moyennée sur 7 jours. */}
        <section className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div className="col-span-2 flex items-center gap-4 border-t border-lk-line pt-4 sm:col-span-1">
            <LockIcon level={progression.level} max={LEVEL_MAX} className="h-12 w-9" />
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-stone-3 uppercase">
                Niveau {progression.level}/{LEVEL_MAX}
              </p>
              <p className="font-display text-lg">{levelName(progression.level)}</p>
            </div>
          </div>
          <Stat label="Score de discipline" value={progression.score7} hint="Moyenne sur 7 jours" />
          <Stat
            label="Priorités tenues"
            value={progression.completedTasks}
            hint={
              <Link href="/dashboard/progression" className="underline underline-offset-4">
                Voir ma progression
              </Link>
            }
          />
        </section>

        <section>
          <GoalsBoard goals={goals} />
        </section>

        <section className="border-t border-lk-line pt-10">
          <RoutineBoard items={routine} />
        </section>
      </div>
    </div>
  );
}
