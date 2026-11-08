"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Handshake, Hash, Plus, Search, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InboxItem } from "@/lib/channel/queries";
import { AvatarStack } from "./avatar";
import { NewConversation } from "./new-conversation";
import { useVisibleInterval } from "./use-visible-interval";

const TIME = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

function shortTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString() ? TIME.format(d) : DAY.format(d);
}

function preview(item: InboxItem) {
  const last = item.lastMessage;
  if (!last) return item.pact?.status === "pending" ? "Invitation à un pacte" : "Nouvelle conversation";
  if (last.kind === "system") return last.body;
  const who = last.mine ? "Toi : " : item.kind === "direct" || item.kind === "pact" ? "" : `${(last.senderName ?? "Membre").split(" ")[0]} : `;
  return `${who}${last.body}`;
}

const KIND_ICON = { direct: null, group: Users, room: Hash, pact: Handshake } as const;

/**
 * Coque de la messagerie : à gauche la liste des conversations (rafraîchie
 * toutes les 5 s), à droite le fil ouvert. Sur mobile, un seul volet à la
 * fois : la liste, ou le fil si une conversation est ouverte.
 */
export function ChannelShell({
  initialInbox,
  meId,
  children,
}: {
  initialInbox: InboxItem[];
  meId: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [inbox, setInbox] = useState(initialInbox);
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);

  const activeId = useMemo(() => {
    const match = pathname.match(/\/dashboard\/messages\/c\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/channel/inbox", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { inbox: InboxItem[] };
      setInbox(data.inbox);
    } catch {
      // Réseau coupé : on garde la liste affichée et on réessaie au prochain tour.
    }
  }, []);
  useVisibleInterval(refresh, 5000);

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? inbox.filter((c) => c.title.toLowerCase().includes(q)) : inbox;
  }, [inbox, filter]);
  const unreadTotal = inbox.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="lk-glass-strong mx-auto flex h-[calc(100dvh-8.5rem)] min-h-[520px] max-w-7xl overflow-hidden rounded-[28px] md:h-[calc(100dvh-9rem)]">
      <aside className={cn("flex w-full shrink-0 flex-col border-r border-lk-line md:w-[340px]", activeId !== null && "hidden md:flex")}>
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">LockIn</p>
            <h1 className="font-display mt-1 flex items-center gap-2 text-xl text-lk-black">
              Secure Channel<span className="text-xs text-lk-stone-3">™</span>
              {unreadTotal > 0 ? (
                <span className="rounded-full bg-lk-blue px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">{unreadTotal}</span>
              ) : null}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            aria-label="Nouvelle conversation"
            className="lk-press lk-shine flex size-10 items-center justify-center rounded-xl bg-lk-blue text-white transition-all hover:bg-lk-blue-soft hover:shadow-focus"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3">
          <label className="flex items-center gap-2 rounded-xl border border-lk-line bg-lk-surface px-3 focus-within:border-lk-blue-soft">
            <Search className="size-4 shrink-0 text-lk-stone-2" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Rechercher"
              aria-label="Rechercher une conversation"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-lk-black outline-none placeholder:text-lk-stone-2"
            />
          </label>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Conversations">
          {shown.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-lk-stone-3">
              {inbox.length === 0 ? "Aucune conversation. Lance la première avec le bouton +." : "Aucun résultat."}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {shown.map((item) => {
              const active = item.id === activeId;
              const Icon = KIND_ICON[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/messages/c/${item.id}`}
                    aria-current={active ? "page" : undefined}
                    className="lk-press relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-lk-surface"
                  >
                    {active ? (
                      <motion.span
                        layoutId="channel-active"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        className="lk-glass absolute inset-0 rounded-2xl"
                      />
                    ) : null}
                    <span className="relative">
                      <AvatarStack people={item.people.filter((p) => p.id !== meId).length ? item.people.filter((p) => p.id !== meId) : item.people} />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {Icon ? <Icon className="size-3.5 shrink-0 text-lk-blue-soft" /> : null}
                          <span className={cn("truncate text-sm", item.unread > 0 ? "font-semibold text-lk-black" : "text-lk-black")}>{item.title}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-lk-stone-2">{shortTime(item.lastMessageAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className={cn("truncate text-xs", item.unread > 0 ? "text-lk-stone-3" : "text-lk-stone-2")}>{preview(item)}</span>
                        {item.unread > 0 ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-lk-blue-soft text-[10px] font-semibold text-white tabular-nums shadow-focus">
                            {item.unread > 9 ? "9+" : item.unread}
                          </span>
                        ) : item.pact?.status === "pending" ? (
                          <span className="shrink-0 rounded-full border border-lk-gold/50 px-1.5 text-[10px] text-lk-gold">Invitation</span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <section className={cn("min-w-0 flex-1", activeId === null && "hidden md:block")}>{children}</section>

      <NewConversation open={creating} onOpenChange={setCreating} />
    </div>
  );
}
