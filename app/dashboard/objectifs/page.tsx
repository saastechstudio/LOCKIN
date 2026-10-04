import { requireLockinOnboarded } from "@/lib/auth";
import { getGoals, getRoutineItems } from "@/lib/actions/goals";
import { GoalsBoard } from "@/components/social/goals-board";
import { RoutineBoard } from "@/components/social/routine-board";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  await requireLockinOnboarded();
  const [goals, routine] = await Promise.all([getGoals(), getRoutineItems()]);

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-12">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
            Lockin Social Club
          </p>
          <h1 className="font-display text-2xl font-bold text-camp-charcoal uppercase">
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
