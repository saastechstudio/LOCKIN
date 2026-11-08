"use client";

import { useState, useTransition } from "react";
import { Brain, Plus, X } from "lucide-react";

import { addMemory, deleteMemory } from "@/lib/actions/copilot";
import type { MemoryKind } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const KINDS: { value: MemoryKind; label: string }[] = [
  { value: "objectif", label: "Objectif" },
  { value: "projet", label: "Projet" },
  { value: "habitude", label: "Habitude" },
  { value: "preference", label: "Préférence" },
  { value: "difficulte", label: "Difficulté" },
];

/**
 * Mémoire du copilote, à découvert : ce qu'il a retenu (et d'où ça vient),
 * ce que le membre lui apprend lui-même, ce qu'il lui fait oublier.
 */
export function MemoryPanel({ memories }: { memories: { id: number; kind: string; content: string; source: string }[] }) {
  const [kind, setKind] = useState<MemoryKind>("preference");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="lk-glass lk-edge rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-lk-gold/15 text-lk-gold">
          <Brain className="size-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">Mémoire</p>
          <p className="text-sm text-lk-black">Ce que ton copilote sait de toi</p>
        </div>
      </div>

      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await addMemory({ kind, content });
            if (!result.ok) return setError(result.error);
            setContent("");
          });
        }}
      >
        <div className="flex flex-wrap gap-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              aria-pressed={kind === k.value}
              onClick={() => setKind(k.value)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                kind === k.value ? "border-lk-gold/60 bg-lk-gold/15 text-lk-black" : "border-lk-line text-lk-stone-3",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex. Je travaille mieux tôt le matin"
            aria-label="Ce que le copilote doit retenir"
            maxLength={200}
            className="lockin-input rounded-xl text-sm"
          />
          <button type="submit" disabled={pending || content.trim().length < 2} className="lockin-button rounded-xl px-3">
            <Plus className="size-4" />
          </button>
        </div>
        {error ? <p className="text-xs text-lk-coral">{error}</p> : null}
      </form>

      <ul className="mt-4 max-h-[420px] space-y-1.5 overflow-y-auto">
        {memories.length === 0 ? (
          <li className="text-xs text-lk-stone-3">
            Rien encore. Le copilote retient ce qu&apos;il apprend à chaque briefing ; tu peux aussi lui écrire ici.
          </li>
        ) : null}
        {memories.map((m) => (
          <li key={m.id} className="group flex items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-lk-surface">
            <span className="mt-0.5 shrink-0 rounded-md bg-lk-surface px-1.5 py-0.5 text-[10px] text-lk-stone-3 uppercase">
              {KINDS.find((k) => k.value === m.kind)?.label ?? m.kind}
            </span>
            <span className="flex-1 text-sm text-lk-black">
              {m.content}
              {m.source === "member" ? <span className="ml-1.5 text-[10px] text-lk-gold">· écrit par toi</span> : null}
            </span>
            <button
              type="button"
              aria-label={`Oublier : ${m.content}`}
              disabled={pending}
              onClick={() => startTransition(async () => void (await deleteMemory(m.id)))}
              className="rounded p-1 text-lk-stone-2 opacity-0 transition-opacity group-hover:opacity-100 hover:text-lk-coral focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
