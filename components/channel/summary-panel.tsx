"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Check, Sparkles } from "lucide-react";

import { addTasksToPlanning, summarizeConversation } from "@/lib/actions/channel";
import type { ConversationSummary } from "@/lib/db/schema";
import { DialogShell } from "./dialog-shell";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="mb-1.5 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** Copilote de conversation : résumé, décisions, tâches, objectifs et engagements. */
export function SummaryButton({ conversationId, initial }: { conversationId: number; initial: ConversationSummary | null }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<ConversationSummary | null>(initial);
  const [byAi, setByAi] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    setAdded(false);
    startTransition(async () => {
      const result = await summarizeConversation(conversationId);
      if (!result.ok) return setError(result.error);
      setSummary(result.data.summary);
      setByAi(result.data.byAi);
    });
  }

  function addTasks() {
    if (!summary || summary.tasks.length === 0) return;
    startTransition(async () => {
      const result = await addTasksToPlanning(summary.tasks.map((t) => t.title));
      if (!result.ok) return setError(result.error);
      setAdded(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (!summary) run();
        }}
        aria-label="Résumé de la conversation"
        title="Résumé du copilote"
        className="lk-press rounded-lg p-2 text-lk-stone-3 transition-colors hover:bg-lk-surface hover:text-lk-black"
      >
        <Sparkles className="size-4" />
      </button>
      <DialogShell open={open} onOpenChange={setOpen} title="Résumé du copilote" description={summary && !byAi ? "Résumé simplifié (IA indisponible)." : "Ce qui s'est dit, décidé et promis."}>
        {pending && !summary ? <div className="lk-skeleton h-32 rounded-2xl" /> : null}
        {summary ? (
          <div>
            <Section title="Résumé">
              <p className="text-sm leading-relaxed text-lk-black">{summary.summary}</p>
            </Section>
            {summary.decisions.length > 0 ? (
              <Section title="Décisions">
                <ul className="space-y-1 text-sm text-lk-black">
                  {summary.decisions.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
              </Section>
            ) : null}
            {summary.tasks.length > 0 ? (
              <Section title="Tâches">
                <ul className="space-y-1 text-sm text-lk-black">
                  {summary.tasks.map((t) => (
                    <li key={t.title}>
                      • {t.title} {t.owner ? <span className="text-lk-stone-3">— {t.owner}</span> : null}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={addTasks}
                  disabled={pending || added}
                  className="lockin-button mt-3 inline-flex items-center gap-2 rounded-xl"
                >
                  {added ? <Check className="size-4" /> : <CalendarPlus className="size-4" />}
                  {added ? "Ajouté au planning" : "Ajouter au planning"}
                </button>
              </Section>
            ) : null}
            {summary.goals.length > 0 ? (
              <Section title="Objectifs évoqués">
                <ul className="space-y-1 text-sm text-lk-black">
                  {summary.goals.map((g) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </Section>
            ) : null}
            {summary.commitments.length > 0 ? (
              <Section title="Engagements">
                <ul className="space-y-1 text-sm text-lk-black">
                  {summary.commitments.map((c) => (
                    <li key={`${c.who}-${c.what}`}>
                      • <span className="font-medium">{c.who}</span> : {c.what} {c.when ? <span className="text-lk-stone-3">({c.when})</span> : null}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
            <button type="button" onClick={run} disabled={pending} className="mt-5 text-xs text-lk-stone-3 underline-offset-2 hover:text-lk-black hover:underline">
              {pending ? "Analyse en cours…" : "Régénérer le résumé"}
            </button>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-3 py-2 text-sm text-lk-coral">
            {error}
          </p>
        ) : null}
      </DialogShell>
    </>
  );
}
