"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Flame, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

import { endPact, respondPact } from "@/lib/actions/channel";
import type { PactCard, PactView } from "@/lib/channel/pact-view";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "./avatar";

function Card({ card, mine }: { card: PactCard; mine: boolean }) {
  return (
    <div className="lk-glass min-w-0 flex-1 rounded-2xl p-3.5">
      <div className="flex items-center gap-2.5">
        <PersonAvatar person={{ id: 0, name: card.name, avatarUrl: card.avatarUrl }} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-lk-black">{mine ? "Toi" : card.name}</p>
          <p className="text-[11px] text-lk-gold">{card.tier}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-display text-2xl text-lk-black tabular-nums">{card.score}</p>
          {card.scoreDelta !== null && card.scoreDelta !== 0 ? (
            <p className={cn("flex items-center justify-end gap-0.5 text-[11px] tabular-nums", card.scoreDelta > 0 ? "text-lk-gold" : "text-lk-coral")}>
              {card.scoreDelta > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {card.scoreDelta > 0 ? "+" : ""}
              {card.scoreDelta}
            </p>
          ) : null}
        </div>
      </div>
      {card.goals.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {card.goals.map((g) => (
            <li key={g.title}>
              <div className="flex justify-between gap-2 text-[11px] text-lk-stone-3">
                <span className="truncate">{g.title}</span>
                <span className="tabular-nums">{g.progress}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-lk-line">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn("h-full rounded-full", g.pace === "behind" ? "bg-lk-coral" : "bg-lk-blue-soft")}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {card.habits.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {card.habits.map((h) => (
            <li
              key={h.label}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                h.doneToday ? "border-lk-blue-soft/50 bg-lk-blue/20 text-lk-black" : "border-lk-line text-lk-stone-3",
              )}
            >
              <Flame className="size-3 text-lk-blue-soft" />
              {h.label} · {h.streak}j
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Suivi mutuel d'un pacte actif : les deux avancées côte à côte et les signaux du copilote. */
export function PactPanel({ view }: { view: PactView }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-b border-lk-line px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase hover:text-lk-black">
          Suivi mutuel
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Terminer ce pacte ? Le suivi mutuel s'arrête.")) return;
            startTransition(async () => {
              await endPact(view.pactId);
              router.refresh();
            });
          }}
          className="text-[11px] text-lk-stone-2 hover:text-lk-coral"
        >
          Terminer le pacte
        </button>
      </div>
      {view.signals.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {view.signals.map((s) => (
            <li key={s.id} className="flex items-start gap-2 rounded-xl border border-lk-line bg-lk-surface px-3 py-2 text-xs text-lk-black">
              <span
                aria-hidden
                className={cn("mt-1 size-2 shrink-0 rounded-full", s.tone === "warning" || s.tone === "critical" ? "bg-lk-coral" : s.tone === "positive" ? "bg-lk-gold" : "bg-lk-blue-soft")}
              />
              {s.message}
            </li>
          ))}
        </ul>
      ) : null}
      {open ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Card card={view.me} mine />
          <Card card={view.partner} mine={false} />
        </motion.div>
      ) : null}
    </div>
  );
}

/** Invitation reçue : accepter ou refuser. */
export function PactInvite({ pactId, from }: { pactId: number; from: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function answer(accept: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await respondPact(pactId, accept);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="border-b border-lk-line px-4 py-4 sm:px-5">
      <p className="text-sm text-lk-black">
        <span className="font-medium">{from}</span> te propose un pacte d&apos;accountability : vous suivez mutuellement objectifs, habitudes et avancées.
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={pending} onClick={() => answer(true)} className="lockin-button rounded-xl">
          Accepter
        </button>
        <button type="button" disabled={pending} onClick={() => answer(false)} className="rounded-xl border border-lk-line px-4 text-sm text-lk-stone-3 hover:text-lk-black">
          Refuser
        </button>
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-lk-coral">{error}</p> : null}
    </div>
  );
}
