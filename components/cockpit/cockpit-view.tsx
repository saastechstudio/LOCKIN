import { DailyCheckin } from "@/components/dashboard/daily-checkin";
import { SphereLife } from "@/components/spherelife/sphere-life";
import type { DailyFocus, EveningBriefing, MorningBriefing } from "@/lib/db/schema";
import type { LifeOsSnapshot } from "@/lib/life-os/snapshot";
import { toUniverse } from "@/lib/life-os/universe";
import { CalendarPanel } from "./calendar-panel";
import { CopilotBriefing } from "./copilot-briefing";
import { FocusPanel } from "./focus-panel";
import { GoalsPanel } from "./goals-panel";
import { Greeting } from "./greeting";
import { HabitsToday } from "./habits-today";
import { InsightsPanel } from "./insights-panel";
import { ScorePanel } from "./score-panel";

const DATE = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

/**
 * Le cockpit Life OS : SphereLife au centre, le copilote juste dessous, puis
 * les instruments (score, objectifs, habitudes, focus, insights, calendrier)
 * et le rituel du soir. Composant d'affichage : il reçoit l'instantané.
 */
export function CockpitView({
  snapshot: s,
  fallback,
  focusRow,
  contacts,
}: {
  snapshot: LifeOsSnapshot;
  fallback: { morning: MorningBriefing; evening: EveningBriefing };
  focusRow: DailyFocus | null;
  contacts: Record<number, { id: number; name: string }[]>;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="lk-rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.25em] text-lk-stone-3 uppercase">{DATE.format(s.today)}</p>
          <h1 className="font-display mt-2 text-3xl text-lk-black sm:text-4xl">
            <Greeting firstName={s.firstName} />
          </h1>
        </div>
        <p className="max-w-sm text-sm text-lk-stone-3">
          Ton copilote veille sur {s.spheres.length} sphère{s.spheres.length > 1 ? "s" : ""} de vie,{" "}
          {s.goals.filter((g) => g.progress < 100).length} objectif
          {s.goals.filter((g) => g.progress < 100).length > 1 ? "s" : ""} et {s.habits.length} habitude
          {s.habits.length > 1 ? "s" : ""}.
        </p>
      </header>

      <div className="lk-rise" style={{ "--i": 1 } as React.CSSProperties}>
        <SphereLife
          spheres={toUniverse(s.spheres, contacts)}
          links={s.links}
          score={s.score.score}
          tierLabel={s.tier.label}
          balance={s.balance}
          signals={s.sphereSignals}
        />
      </div>

      <div className="lk-rise" style={{ "--i": 2 } as React.CSSProperties}>
        <CopilotBriefing
          stored={{ morning: s.briefings.morning, evening: s.briefings.evening }}
          authors={s.briefings.authors}
          fallback={fallback}
          dateKey={s.today.toISOString().slice(0, 10)}
        />
      </div>

      <div className="lk-stagger grid gap-6 lg:grid-cols-3" style={{ "--base": 3 } as React.CSSProperties}>
        <ScorePanel
          score={s.score.score}
          yesterday={s.yesterdayScore}
          components={s.score.components}
          week={s.week}
          weakest={s.weakest}
        />
        <GoalsPanel goals={s.goals} spheres={s.spheres} />
        <FocusPanel
          focusScore={s.focus.score}
          todayMinutes={s.focus.todayMinutes}
          weekMinutes={s.focus.weekMinutes}
          goals={s.goals.filter((g) => g.progress < 100).map((g) => ({ id: g.id, title: g.title }))}
        />
      </div>

      <div className="lk-stagger grid gap-6 lg:grid-cols-5" style={{ "--base": 6 } as React.CSSProperties}>
        <div className="lg:col-span-3">
          <HabitsToday habits={s.habits} />
        </div>
        <div className="lg:col-span-2">
          <InsightsPanel insights={s.insights} />
        </div>
      </div>

      <div className="lk-stagger grid gap-6 lg:grid-cols-2" style={{ "--base": 8 } as React.CSSProperties}>
        <CalendarPanel today={s.today} items={s.calendar} habitsCount={s.habits.length} />
        {focusRow ? <DailyCheckin focus={focusRow} /> : null}
      </div>
    </div>
  );
}
