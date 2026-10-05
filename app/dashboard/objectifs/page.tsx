import { requireLockinOnboarded } from "@/lib/auth";
import { getGoals, getRoutineItems } from "@/lib/actions/goals";
import { GoalsBoard } from "@/components/social/goals-board";
import { RoutineBoard } from "@/components/social/routine-board";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  await requireLockinOnboarded();
  const [goals, routine] = await Promise.all([getGoals(), getRoutineItems()]);

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl space-y-12">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-black/50 uppercase">
            Lockin Social Club
          </p>
          <h1 className="font-display text-3xl text-lk-black sm:text-4xl">
            Objectifs
          </h1>
          <p className="mt-1 text-sm text-camp-charcoal/60">
            Personnel, professionnel, et les routines qui les font tenir.
          </p>
        </div>

        <section>
          <GoalsBoard goals={goals} />
        </section>

        <section className="border-t-2 border-camp-charcoal pt-10">
          <RoutineBoard items={routine} />
        </section>
      </div>
    </div>
  );
}
