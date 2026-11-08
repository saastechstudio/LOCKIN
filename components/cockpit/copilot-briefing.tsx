"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, MoonStar, Sparkles, Sun, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { requestBriefing } from "@/lib/actions/copilot";
import type { BriefingContent, EveningBriefing, MorningBriefing } from "@/lib/db/schema";
import { Panel } from "./ring";

type Period = "morning" | "evening";

/**
 * Le copilote parle : briefing du matin, bilan du soir. La version calculée
 * s'affiche tout de suite ; si l'IA n'a pas encore écrit celle du jour, elle
 * est demandée une fois en arrière-plan et la remplace à son arrivée.
 */
export function CopilotBriefing({
  stored,
  authors,
  fallback,
  dateKey,
}: {
  stored: { morning: BriefingContent | null; evening: BriefingContent | null };
  authors: Record<string, string>;
  fallback: { morning: MorningBriefing; evening: EveningBriefing };
  dateKey: string;
}) {
  const [period, setPeriod] = useState<Period>("morning");
  const [ai, setAi] = useState(stored);
  const [aiAuthors, setAiAuthors] = useState(authors);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    // L'heure locale du membre décide du moment : le serveur ne la connaît pas.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriod(new Date().getHours() >= 17 ? "evening" : "morning");
  }, []);

  useEffect(() => {
    if (ai[period]) return;
    const marker = `lk-briefing:${dateKey}:${period}`;
    try {
      if (window.sessionStorage.getItem(marker)) return;
      window.sessionStorage.setItem(marker, "1");
    } catch {
      // Stockage indisponible : on tente quand même, le serveur limite le débit.
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThinking(true);
    requestBriefing(period)
      .then((result) => {
        if (cancelled || !result.ok || !result.data) return;
        const { content, author } = result.data;
        setAi((prev) => ({ ...prev, [period]: content }));
        setAiAuthors((prev) => ({ ...prev, [period]: author }));
      })
      .finally(() => {
        if (!cancelled) setThinking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ai, period, dateKey]);

  const morning = (ai.morning as (MorningBriefing & { period: "morning" }) | null) ?? fallback.morning;
  const evening = (ai.evening as (EveningBriefing & { period: "evening" }) | null) ?? fallback.evening;
  const byAi = Boolean(ai[period]);

  return (
    <Panel className="lk-glow-blue relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(circle,rgba(224, 75, 95,0.35),transparent_70%)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-lk-blue/30 text-lk-blue-soft">
            <Sparkles className={cn("size-4", thinking && "animate-pulse")} />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Copilote</p>
            <p className="text-xs text-lk-stone-3">
              {thinking ? "Analyse de ta journée…" : byAi ? `Rédigé par l'IA (${aiAuthors[period]})` : "Calculé à partir de tes données"}
            </p>
          </div>
        </div>
        <div className="flex rounded-xl border border-lk-line bg-lk-white/40 p-1" role="tablist" aria-label="Moment">
          {(
            [
              ["morning", "Matin", Sun],
              ["evening", "Soir", MoonStar],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={period === value}
              onClick={() => setPeriod(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                period === value ? "bg-lk-surface text-lk-black shadow-sm" : "text-lk-stone-3 hover:text-lk-black",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {period === "morning" ? <Morning b={morning} /> : <Evening b={evening} />}
    </Panel>
  );
}

function Morning({ b }: { b: MorningBriefing }) {
  return (
    <div key="morning" className="animate-fade-up mt-5">
      <h2 className="font-display text-2xl text-lk-black sm:text-3xl">{b.headline}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lk-stone-3">{b.summary}</p>

      {b.alerts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {b.alerts.map((a) => (
            <li
              key={a.message}
              className={cn(
                "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                a.level === "critical"
                  ? "border-lk-coral/40 bg-lk-coral/10 text-lk-black"
                  : a.level === "warning"
                    ? "border-lk-gold/40 bg-lk-gold/10 text-lk-black"
                    : "border-lk-line text-lk-stone-3",
              )}
            >
              <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", a.level === "critical" ? "text-lk-coral" : "text-lk-gold")} />
              {a.message}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Priorités</p>
          <ol className="mt-2.5 space-y-2.5">
            {b.priorities.map((p, i) => (
              <li key={p.title} className="flex gap-3">
                <span className="font-display flex size-6 shrink-0 items-center justify-center rounded-lg bg-lk-blue/30 text-xs text-lk-black">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-lk-black">{p.title}</p>
                  <p className="text-xs text-lk-stone-3">{p.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          {b.habits.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Habitudes du jour</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {b.habits.map((h) => (
                  <li key={h} className="rounded-full border border-lk-line bg-lk-surface px-3 py-1 text-xs text-lk-black">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {b.goalMoves.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Objectifs à avancer</p>
              <ul className="mt-2 space-y-1.5">
                {b.goalMoves.map((g) => (
                  <li key={g.goal} className="text-sm">
                    <span className="text-lk-stone-3">{g.goal} → </span>
                    <span className="text-lk-black">{g.nextStep}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Evening({ b }: { b: EveningBriefing }) {
  return (
    <div key="evening" className="animate-fade-up mt-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-lk-black sm:text-3xl">{b.headline}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lk-stone-3">{b.summary}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Discipline</p>
          <p className="font-display text-4xl text-lk-gold tabular-nums">{b.disciplineScore}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-lk-stone-3">{b.disciplineComment}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <List title="Réussites" items={b.wins} icon={<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-lk-gold" />} />
        <List title="À reprendre" items={b.misses} icon={<XCircle className="mt-0.5 size-4 shrink-0 text-lk-coral" />} />
        <List title="Demain" items={b.tomorrow} icon={<Sun className="mt-0.5 size-4 shrink-0 text-lk-blue-soft" />} />
      </div>
    </div>
  );
}

function List({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.length === 0 ? <li className="text-xs text-lk-stone-2">Rien à signaler.</li> : null}
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-lk-black">
            {icon}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
