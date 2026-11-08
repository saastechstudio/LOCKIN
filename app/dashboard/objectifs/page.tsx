import { desc, eq } from "drizzle-orm";

import { getOrCreateDbUser } from "@/lib/auth";
import { isClubMember } from "@/lib/club/access";
import { db } from "@/lib/db";
import { okrs } from "@/lib/db/schema";
import { getRoutineItems } from "@/lib/actions/goals";
import { loadLifeOs } from "@/lib/life-os/snapshot";
import { GoalComposer } from "@/components/goals/goal-composer";
import { LivingGoal } from "@/components/goals/living-goal";
import { OkrCard } from "@/components/dashboard/okr-card";
import { NewOkrDialog } from "@/components/dashboard/new-okr-dialog";
import { RoutineBoard } from "@/components/social/routine-board";

export const dynamic = "force-dynamic";

/**
 * Objectifs vivants : chaque objectif a sa vision, ses jalons, ses tâches,
 * son temps investi et ses difficultés détectées. Les routines et les
 * indicateurs chiffrés (OKR) restent en dessous.
 */
export default async function ObjectifsPage() {
  const user = await getOrCreateDbUser();
  const [snapshot, routine, userOkrs] = await Promise.all([
    loadLifeOs(user),
    getRoutineItems(),
    db.query.okrs.findMany({ where: eq(okrs.userId, user.id), orderBy: [desc(okrs.createdAt)] }),
  ]);
  const spheres = snapshot.spheres.map((s) => ({ id: s.id, name: s.name, color: s.color }));
  const active = snapshot.goals.filter((g) => g.progress < 100);
  const done = snapshot.goals.filter((g) => g.progress >= 100);
  const canShare = isClubMember(user);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="animate-fade-up">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Life OS · Objectifs</p>
        <h1 className="font-display mt-2 text-3xl text-lk-black sm:text-4xl">Des objectifs qui vivent</h1>
        <p className="mt-2 max-w-xl text-sm text-lk-stone-3">
          Une vision, des jalons, des tâches, le temps que tu y investis. Le copilote suit le rythme et te signale
          quand un objectif décroche.
        </p>
      </header>

      <div className="animate-fade-up [animation-delay:80ms]">
        <GoalComposer spheres={spheres} />
      </div>

      <section className="space-y-4">
        {active.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">
            Aucun objectif en cours. Écris-en un ci-dessus : le copilote s&apos;occupe du découpage.
          </p>
        ) : null}
        {active.map((goal, i) => (
          <LivingGoal key={goal.id} goal={goal} spheres={spheres} canShare={canShare} defaultOpen={i === 0} />
        ))}
      </section>

      {done.length > 0 ? (
        <section className="space-y-4">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-gold uppercase">Accomplis</p>
          {done.map((goal) => (
            <LivingGoal key={goal.id} goal={goal} spheres={spheres} canShare={canShare} />
          ))}
        </section>
      ) : null}

      <section className="lk-glass rounded-3xl p-6">
        <RoutineBoard items={routine} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Indicateurs chiffrés</p>
            <h2 className="font-display mt-1 text-xl text-lk-black">OKR</h2>
          </div>
          <NewOkrDialog />
        </div>
        {userOkrs.length === 0 ? (
          <p className="text-sm text-lk-stone-3">Un chiffre à atteindre (chiffre d&apos;affaires, kilos, heures) : crée un OKR.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {userOkrs.map((okr) => (
              <OkrCard key={okr.id} okr={okr} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
