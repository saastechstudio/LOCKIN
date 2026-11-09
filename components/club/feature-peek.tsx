import { Check, Flame, Handshake, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Extraits des vraies fonctionnalités de LockIn, rendus en verre : à la place
 * des cadres photo vides du hero. Données d'illustration, interface réelle.
 */

function Frame({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <figure
      className={cn("lk-glass relative flex h-full w-full flex-col overflow-hidden rounded-[20px] p-4 text-lk-black sm:p-5", className)}
      aria-label={label}
    >
      <figcaption className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-lk-stone-3 uppercase">{label}</figcaption>
      {children}
    </figure>
  );
}

const WEEK = [52, 61, 58, 70, 66, 74, 78];

/** LockIn Score : l'anneau et les sept derniers jours. */
export function ScorePeek({ className }: { className?: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <Frame label="LockIn Score" className={cn("lg:pl-16", className)}>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:gap-4 lg:flex-col">
        <div className="relative size-24 shrink-0 sm:size-28">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90 drop-shadow-[0_0_14px_rgba(167,243,208,0.55)]">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#ecfdf5" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.22} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl leading-none tabular-nums sm:text-4xl">78</span>
            <span className="mt-1 flex items-center gap-0.5 text-[10px] text-lk-gold">
              <TrendingUp className="size-3" /> +4
            </span>
          </div>
        </div>
        <div className="w-full min-w-0 flex-1 lg:flex-none">
          <p className="text-xs text-lk-stone-3">7 derniers jours</p>
          <div className="mt-2 flex h-14 items-end gap-1.5 sm:h-16">
            {WEEK.map((v, i) => (
              <span key={i} className={cn("flex-1 rounded-t-md", i === WEEK.length - 1 ? "bg-white" : "bg-white/35")} style={{ height: `${v}%` }} />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/** Secure Channel : un pacte d'accountability en cours. */
export function ChannelPeek({ className }: { className?: string }) {
  return (
    <Frame label="Secure Channel" className={className}>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-lk-line bg-lk-surface px-3 py-2">
        <Handshake className="size-4 text-lk-blue-soft" />
        <span className="text-xs whitespace-nowrap">Pacte · Ana</span>
        <span className="ml-auto whitespace-nowrap text-[11px] tabular-nums text-lk-stone-3">
          <b className="text-sm text-lk-black">74</b> · <b className="text-sm text-lk-black">81</b>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 text-[13px] leading-snug">
        <p className="max-w-[82%] self-start rounded-2xl rounded-bl-md border border-lk-line bg-white/10 px-3 py-2">Objectif : 3 séances et 2h de deep work par jour.</p>
        <p className="max-w-[82%] self-end rounded-2xl rounded-br-md bg-lk-blue px-3 py-2 shadow-[0_6px_20px_-8px_rgba(2,44,34,0.8)]">Deal. On se tient responsables 💪</p>
        <p className="max-w-[88%] self-start rounded-2xl rounded-bl-md border border-lk-gold/50 bg-white/10 px-3 py-2">
          <span className="mb-0.5 block text-[9px] font-semibold tracking-[0.2em] text-lk-gold uppercase">Check-in</span>3 séances cette semaine, 9 h de focus.
        </p>
      </div>
    </Frame>
  );
}

const HABITS = [
  { label: "Sport", streak: 12, done: true },
  { label: "Lecture", streak: 8, done: true },
  { label: "Deep work", streak: 5, done: false },
];

/** Habitudes du jour et séries. */
export function HabitsPeek({ className }: { className?: string }) {
  return (
    <Frame label="Habitudes" className={className}>
      <ul className="flex flex-1 flex-col justify-center gap-2">
        {HABITS.map((h) => (
          <li key={h.label} className="flex items-center gap-2 text-xs">
            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", h.done ? "border-transparent bg-white text-lk-blue" : "border-lk-line")}>
              {h.done ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
            <span className="flex-1 truncate">{h.label}</span>
            <span className="flex items-center gap-0.5 text-lk-stone-3 tabular-nums">
              <Flame className="size-3 text-lk-blue-soft" />
              {h.streak}j
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
