import { getOrCreateDbUser } from "@/lib/auth";
import { loadLifeOs } from "@/lib/life-os/snapshot";
import { HabitsStudio } from "@/components/habits/habits-studio";
import { InsightsPanel } from "@/components/cockpit/insights-panel";

export const dynamic = "force-dynamic";

/** Habitudes : sommeil, sport, lecture, méditation, travail, nutrition — suivies au jour, lues par le copilote. */
export default async function HabitudesPage() {
  const user = await getOrCreateDbUser();
  const snapshot = await loadLifeOs(user);
  const habitInsights = snapshot.insights.filter((i) => i.id.startsWith("habit-"));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="lk-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.35em] text-lk-stone-3 uppercase">Life OS · Habitudes</p>
          <h1 className="font-display mt-2 text-3xl text-lk-black sm:text-4xl">Ce que tu répètes te construit</h1>
          <p className="mt-2 max-w-xl text-sm text-lk-stone-3">
            Une cible par jour, un geste pour la noter. Le copilote lit tes tendances et te prévient avant que ça décroche.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.3em] text-lk-stone-3 uppercase">Tenues aujourd&apos;hui</p>
          <p className="font-display lk-text-glow text-4xl text-lk-black tabular-nums">
            {snapshot.habits.filter((h) => h.doneToday).length}/{snapshot.habits.length}
          </p>
        </div>
      </header>

      <HabitsStudio habits={snapshot.habits} spheres={snapshot.spheres.map((s) => ({ id: s.id, name: s.name, color: s.color }))} />

      {habitInsights.length > 0 ? <InsightsPanel insights={habitInsights} /> : null}
    </div>
  );
}
