"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Handshake, Hash, MessageSquare, Users, X } from "lucide-react";

import type { ActionResult } from "@/lib/action-result";
import { createGroup, createPact, createRoom, findMembers, getOpenRooms, joinRoom, startDirect } from "@/lib/actions/channel";
import { ROOM_TOPICS } from "@/lib/channel/constants";
import type { Person } from "@/lib/channel/queries";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "./avatar";

type Mode = "direct" | "group" | "room" | "pact";

const MODES: { id: Mode; label: string; hint: string; icon: typeof MessageSquare }[] = [
  { id: "direct", label: "Message", hint: "Un échange privé avec un membre.", icon: MessageSquare },
  { id: "group", label: "Groupe", hint: "Un projet, une équipe, quelques membres.", icon: Users },
  { id: "room", label: "Salon", hint: "Un salon ouvert autour d'un thème.", icon: Hash },
  { id: "pact", label: "Pacte", hint: "Deux membres qui se tiennent mutuellement responsables.", icon: Handshake },
];

/** Recherche de membres avec un délai de frappe : une requête quand on s'arrête d'écrire. */
function MemberSearch({ onPick, picked = [] }: { onPick: (p: Person) => void; picked?: number[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      const result = await findMembers(query);
      if (!cancelled) {
        setResults(result.ok ? result.data : []);
        setSearching(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nom du membre…"
        aria-label="Rechercher un membre"
        className="lockin-input rounded-xl"
      />
      <ul className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
        {query.trim().length >= 2 && !searching && results.length === 0 ? (
          <li className="px-2 py-3 text-xs text-lk-stone-3">Aucun membre trouvé.</li>
        ) : null}
        {results.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              disabled={picked.includes(p.id)}
              onClick={() => onPick(p)}
              className="lk-press flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-lk-surface disabled:opacity-40"
            >
              <PersonAvatar person={p} size="sm" />
              <span className="text-sm text-lk-black">{p.name ?? "Membre"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewConversation({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("direct");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [members, setMembers] = useState<Person[]>([]);
  const [topic, setTopic] = useState<(typeof ROOM_TOPICS)[number]>(ROOM_TOPICS[0]);
  const [rooms, setRooms] = useState<{ id: number; title: string; topic: string | null; members: number }[]>([]);

  useEffect(() => {
    if (!open || mode !== "room") return;
    let cancelled = false;
    getOpenRooms().then((result) => {
      if (!cancelled && result.ok) setRooms(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, mode]);

  function go(task: () => Promise<ActionResult<{ conversationId: number }>>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) return setError(result.error);
      onOpenChange(false);
      setTitle("");
      setMembers([]);
      router.push(`/dashboard/messages/c/${result.data.conversationId}`);
      router.refresh();
    });
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="lk-glass-strong data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 w-[min(520px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <DialogPrimitive.Title className="font-display text-xl text-lk-black">Nouvelle conversation</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-lk-stone-3">{MODES.find((m) => m.id === mode)?.hint}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black">
              <X className="size-4" />
              <span className="sr-only">Fermer</span>
            </DialogPrimitive.Close>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1.5 rounded-2xl border border-lk-line bg-lk-surface p-1" role="tablist">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => {
                  setMode(m.id);
                  setError(null);
                  setMembers([]);
                }}
                className={cn(
                  "lk-press flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition-all",
                  mode === m.id ? "bg-lk-blue text-white shadow-focus" : "text-lk-stone-3 hover:text-lk-black",
                )}
              >
                <m.icon className="size-4" />
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-5 min-h-48">
            {mode === "direct" || mode === "pact" ? (
              <MemberSearch
                onPick={(p) => go(() => (mode === "direct" ? startDirect(p.id) : createPact(p.id)))}
              />
            ) : null}

            {mode === "group" ? (
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nom du groupe"
                  aria-label="Nom du groupe"
                  maxLength={60}
                  className="lockin-input rounded-xl"
                />
                {members.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {members.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setMembers((prev) => prev.filter((x) => x.id !== p.id))}
                          className="inline-flex items-center gap-1.5 rounded-full border border-lk-line bg-lk-surface py-1 pr-2 pl-1 text-xs text-lk-black hover:border-lk-coral"
                        >
                          <PersonAvatar person={p} size="sm" className="size-5 text-[10px]" /> {p.name} <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <MemberSearch picked={members.map((m) => m.id)} onPick={(p) => setMembers((prev) => [...prev, p])} />
                <button
                  type="button"
                  disabled={pending || title.trim().length < 2 || members.length === 0}
                  onClick={() => go(() => createGroup({ title, memberIds: members.map((m) => m.id) }))}
                  className="lockin-button w-full rounded-xl"
                >
                  Créer le groupe ({members.length})
                </button>
              </div>
            ) : null}

            {mode === "room" ? (
              <div className="space-y-4">
                {rooms.length > 0 ? (
                  <ul className="max-h-36 space-y-1 overflow-y-auto">
                    {rooms.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => go(() => joinRoom(r.id))}
                          className="lk-press flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-lk-surface"
                        >
                          <span className="text-sm text-lk-black">
                            <Hash className="mr-1.5 inline size-3.5 text-lk-blue-soft" />
                            {r.title}
                          </span>
                          <span className="text-xs text-lk-stone-3">
                            {r.topic} · {r.members} membre{r.members > 1 ? "s" : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-lk-stone-3">Aucun salon à rejoindre pour l&apos;instant. Crée le premier.</p>
                )}
                <div className="space-y-2 border-t border-lk-line pt-4">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom du salon"
                    aria-label="Nom du salon"
                    maxLength={60}
                    className="lockin-input rounded-xl"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ROOM_TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={topic === t}
                        onClick={() => setTopic(t)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          topic === t ? "border-lk-blue-soft bg-lk-blue/30 text-lk-black" : "border-lk-line text-lk-stone-3 hover:text-lk-black",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={pending || title.trim().length < 2}
                    onClick={() => go(() => createRoom({ title, topic }))}
                    className="lockin-button w-full rounded-xl"
                  >
                    Créer le salon
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="mt-3 rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-3 py-2 text-sm text-lk-coral">
              {error}
            </p>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
