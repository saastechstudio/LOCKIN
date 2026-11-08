"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  Ban,
  CornerUpLeft,
  Flag,
  Handshake,
  Hash,
  Link2,
  LogOut,
  Send,
  Smile,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { ReportButton } from "@/components/moderation/report-button";
import {
  blockUser,
  deleteChatMessage,
  leaveConversation,
  markRead,
  sendChatMessage,
  toggleReaction,
} from "@/lib/actions/channel";
import { EMOJI_GROUPS, MAX_BODY, REACTIONS } from "@/lib/channel/constants";
import type { ChannelMessage, Person } from "@/lib/channel/queries";
import { cn } from "@/lib/utils";
import { AvatarStack } from "./avatar";
import { useVisibleInterval } from "./use-visible-interval";

export type ThreadMeta = {
  id: number;
  kind: "direct" | "group" | "room" | "pact";
  title: string;
  topic: string | null;
  people: Person[];
  meId: number;
  pactStatus: "pending" | "active" | "ended" | null;
  links: { type: "goal" | "habit" | "sphere"; label: string; href: string }[];
};

const HOUR = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const DAY_LABEL = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return DAY_LABEL.format(d);
}

type Row =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: ChannelMessage; first: boolean; last: boolean };

/** Regroupe les messages consécutifs d'un même auteur et insère les séparateurs de jour. */
function toRows(messages: ChannelMessage[]): Row[] {
  const rows: Row[] = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    if (!prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString()) {
      rows.push({ type: "day", key: `d-${m.id}`, label: dayLabel(m.createdAt) });
    }
    const sameAsPrev = prev && prev.sender.id === m.sender.id && prev.kind === m.kind && m.kind !== "system" && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
    const sameAsNext = next && next.sender.id === m.sender.id && next.kind === m.kind && m.kind !== "system" && new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime() < 5 * 60_000;
    rows.push({ type: "message", key: `m-${m.id}`, message: m, first: !sameAsPrev, last: !sameAsNext });
  });
  return rows;
}

export function Thread({
  meta,
  initialMessages,
  headerExtra,
  children,
}: {
  meta: ThreadMeta;
  initialMessages: ChannelMessage[];
  /** Boutons du copilote et des liens, fournis par la page. */
  headerExtra?: React.ReactNode;
  /** Panneaux au-dessus du fil (pacte, résumé). */
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [pendingOut, setPendingOut] = useState<ChannelMessage[]>([]);
  const [replyTo, setReplyTo] = useState<ChannelMessage | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [isSending, startSend] = useTransition();
  const [, startAction] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lastId = useRef(initialMessages.at(-1)?.id ?? 0);
  const stick = useRef(true);
  // Seuls les messages arrivés après l'ouverture s'animent : l'historique apparaît d'un bloc.
  const [initialIds] = useState(() => new Set(initialMessages.map((m) => m.id)));

  const canWrite = meta.kind !== "pact" || meta.pactStatus === "active";
  const others = meta.people.filter((p) => p.id !== meta.meId);

  useEffect(() => {
    lastId.current = messages.at(-1)?.id ?? lastId.current;
  }, [messages]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // Au changement de messages, on reste collé en bas si on y était.
  useLayoutEffect(() => {
    if (stick.current) scrollToBottom(true);
  }, [messages, pendingOut, scrollToBottom]);

  const poll = useCallback(async () => {
    try {
      const response = await fetch(`/api/channel/messages?c=${meta.id}&after=${lastId.current}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: ChannelMessage[] };
      if (data.messages.length === 0) return;
      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const fresh = data.messages.filter((m) => !known.has(m.id));
        return fresh.length ? [...prev, ...fresh] : prev;
      });
      if (data.messages.some((m) => !m.mine)) void markRead(meta.id);
    } catch {
      // Réseau coupé : le prochain tour réessaie.
    }
  }, [meta.id]);
  useVisibleInterval(poll, 2500);

  // Réactions et suppressions arrivent sans nouveau message : on rafraîchit les 60 derniers de temps en temps.
  const refreshRecent = useCallback(async () => {
    try {
      const response = await fetch(`/api/channel/messages?c=${meta.id}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: ChannelMessage[] };
      setMessages((prev) => {
        const byId = new Map(data.messages.map((m) => [m.id, m]));
        const merged = prev.map((m) => byId.get(m.id) ?? m);
        const known = new Set(prev.map((m) => m.id));
        return [...merged, ...data.messages.filter((m) => !known.has(m.id))].sort((a, b) => a.id - b.id);
      });
    } catch {
      // idem
    }
  }, [meta.id]);
  useVisibleInterval(refreshRecent, 12_000);

  useEffect(() => {
    void markRead(meta.id).then(() => router.refresh());
    // Une seule fois à l'ouverture de la conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.id]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stick.current = near;
    setAtBottom(near);
  }

  function send(kind: "text" | "checkin" = "text") {
    const text = body.trim();
    if (!text || isSending) return;
    setError(null);
    const tempId = -Date.now();
    const optimistic: ChannelMessage = {
      id: tempId,
      conversationId: meta.id,
      kind,
      body: text,
      createdAt: new Date().toISOString(),
      deleted: false,
      sender: meta.people.find((p) => p.id === meta.meId) ?? { id: meta.meId, name: "Moi", avatarUrl: null },
      mine: true,
      replyTo: replyTo ? { id: replyTo.id, body: replyTo.body.slice(0, 120), senderName: replyTo.sender.name } : null,
      reactions: [],
    };
    setPendingOut((p) => [...p, optimistic]);
    setBody("");
    setReplyTo(null);
    setEmojiOpen(false);
    stick.current = true;
    startSend(async () => {
      const result = await sendChatMessage({ conversationId: meta.id, body: text, replyToId: replyTo?.id ?? null, kind });
      await poll();
      setPendingOut((p) => p.filter((m) => m.id !== tempId));
      if (!result.ok) {
        setError(result.error);
        setBody(text);
      }
    });
    requestAnimationFrame(() => textarea.current?.focus());
  }

  function react(message: ChannelMessage, emoji: string) {
    // Mise à jour immédiate, confirmée par le serveur au prochain rafraîchissement.
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== message.id) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        const reactions = existing
          ? existing.mine
            ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, mine: false } : r)).filter((r) => r.count > 0)
            : m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r))
          : [...m.reactions, { emoji, count: 1, mine: true }];
        return { ...m, reactions };
      }),
    );
    startAction(async () => {
      const result = await toggleReaction(message.id, emoji);
      if (!result.ok) {
        setError(result.error);
        void refreshRecent();
      }
    });
  }

  function remove(message: ChannelMessage) {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, deleted: true, body: "" } : m)));
    startAction(async () => {
      await deleteChatMessage(message.id);
    });
  }

  const rows = useMemo(() => toRows([...messages, ...pendingOut]), [messages, pendingOut]);
  const KindIcon = meta.kind === "room" ? Hash : meta.kind === "pact" ? Handshake : meta.kind === "group" ? Users : null;

  return (
    <div className="lk-aurora relative isolate flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-lk-line px-4 py-3 sm:px-5">
        <Link href="/dashboard/messages" aria-label="Retour aux conversations" className="lk-press -ml-1 rounded-xl p-2 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <AvatarStack people={others.length ? others : meta.people} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display flex items-center gap-1.5 truncate text-base text-lk-black">
            {KindIcon ? <KindIcon className="size-4 shrink-0 text-lk-blue-soft" /> : null}
            <span className="truncate">{meta.title}</span>
          </h2>
          <p className="truncate text-xs text-lk-stone-3">
            {meta.kind === "pact"
              ? meta.pactStatus === "active"
                ? "Pacte d'accountability"
                : meta.pactStatus === "pending"
                  ? "Invitation en attente"
                  : "Pacte terminé"
              : meta.kind === "direct"
                ? "Échange privé"
                : `${meta.people.length} membres${meta.topic ? ` · ${meta.topic}` : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {headerExtra}
          <ThreadMenu meta={meta} others={others} />
        </div>
      </header>

      {meta.links.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-lk-line px-4 py-2 sm:px-5">
          <Link2 className="size-3.5 text-lk-stone-2" />
          {meta.links.map((l) => (
            <Link
              key={`${l.type}-${l.label}`}
              href={l.href}
              className="lk-press rounded-full border border-lk-blue-soft/40 bg-lk-blue/20 px-2.5 py-0.5 text-[11px] text-lk-black transition-colors hover:border-lk-blue-soft"
            >
              {l.type === "goal" ? "Objectif" : l.type === "habit" ? "Habitude" : "Sphère"} · {l.label}
            </Link>
          ))}
        </div>
      ) : null}

      {children}

      <div className="relative min-h-0 flex-1">
        <div ref={scroller} onScroll={onScroll} className="h-full overflow-y-auto px-3 py-4 sm:px-5" role="log" aria-live="polite" aria-label="Messages">
          {rows.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="animate-float flex size-14 items-center justify-center rounded-2xl bg-lk-blue/25 text-lk-blue-soft shadow-[0_0_40px_rgba(16,185,129,0.45)]">
                <Sparkles className="size-6" />
              </span>
              <p className="font-display mt-4 text-lg text-lk-black">Commence l&apos;échange</p>
              <p className="mt-1 max-w-xs text-sm text-lk-stone-3">Fixe un objectif, partage une avancée, demande un coup de main.</p>
            </div>
          ) : null}
          {rows.map((row) =>
            row.type === "day" ? (
              <div key={row.key} className="my-4 flex items-center justify-center">
                <span className="rounded-full border border-lk-line bg-lk-surface px-3 py-0.5 text-[11px] text-lk-stone-3 capitalize">{row.label}</span>
              </div>
            ) : (
              <Bubble
                key={row.key}
                message={row.message}
                first={row.first}
                last={row.last}
                fresh={!initialIds.has(row.message.id)}
                showName={meta.kind !== "direct" && meta.kind !== "pact"}
                onReply={() => {
                  setReplyTo(row.message);
                  textarea.current?.focus();
                }}
                onReact={(emoji) => react(row.message, emoji)}
                onDelete={() => remove(row.message)}
              />
            ),
          )}
        </div>
        {!atBottom ? (
          <button
            type="button"
            onClick={() => {
              stick.current = true;
              scrollToBottom(true);
            }}
            aria-label="Aller au dernier message"
            className="lk-glass-strong lk-press absolute right-5 bottom-3 flex size-10 items-center justify-center rounded-full text-lk-black"
          >
            <ArrowDown className="size-4" />
          </button>
        ) : null}
      </div>

      {canWrite ? (
        <div className="border-t border-lk-line p-3 sm:p-4">
          {replyTo ? (
            <div className="lk-rise mb-2 flex items-center gap-2 rounded-xl border border-lk-line bg-lk-surface px-3 py-1.5 text-xs">
              <CornerUpLeft className="size-3.5 shrink-0 text-lk-blue-soft" />
              <span className="min-w-0 flex-1 truncate text-lk-stone-3">
                <span className="text-lk-black">{replyTo.sender.name ?? "Membre"}</span> · {replyTo.body}
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-lk-stone-3 hover:text-lk-black" aria-label="Annuler la réponse">
                ✕
              </button>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="lk-rise mb-2 rounded-xl border border-lk-coral/40 bg-lk-coral/10 px-3 py-1.5 text-xs text-lk-coral">
              {error}
            </p>
          ) : null}
          <div className="relative">
            <AnimatePresence>
            {emojiOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 460, damping: 32 }}
                style={{ transformOrigin: "0% 100%" }}
                className="lk-glass-strong absolute bottom-full left-0 z-10 mb-2 w-72 rounded-2xl p-3"
              >
                {EMOJI_GROUPS.map((g) => (
                  <div key={g.label} className="mb-2 last:mb-0">
                    <p className="mb-1 text-[10px] tracking-[0.2em] text-lk-stone-2 uppercase">{g.label}</p>
                    <div className="flex flex-wrap gap-0.5">
                      {g.emojis.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => {
                            setBody((b) => b + e);
                            textarea.current?.focus();
                          }}
                          className="lk-press flex size-8 items-center justify-center rounded-lg text-lg hover:bg-lk-surface"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null}
            </AnimatePresence>
            <div className="flex items-end gap-2 rounded-2xl border border-lk-line bg-lk-surface p-1.5 transition-colors focus-within:border-lk-blue-soft focus-within:shadow-focus">
              <button
                type="button"
                onClick={() => setEmojiOpen((v) => !v)}
                aria-label="Emojis"
                aria-expanded={emojiOpen}
                className="lk-press flex size-10 shrink-0 items-center justify-center rounded-xl text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black"
              >
                <Smile className="size-5" />
              </button>
              <textarea
                ref={textarea}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value.slice(0, MAX_BODY));
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(meta.kind === "pact" ? "text" : "text");
                  }
                }}
                rows={1}
                placeholder={meta.kind === "pact" ? "Ton avancée, ton objectif de la semaine…" : "Écris un message…"}
                aria-label="Message"
                className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-lk-black outline-none placeholder:text-lk-stone-2"
              />
              {meta.kind === "pact" ? (
                <button
                  type="button"
                  onClick={() => send("checkin")}
                  disabled={!body.trim() || isSending}
                  title="Envoyer comme check-in"
                  className="lk-press hidden h-10 shrink-0 items-center rounded-xl border border-lk-gold/40 px-3 text-xs text-lk-gold transition-colors hover:bg-lk-gold/10 disabled:opacity-30 sm:flex"
                >
                  Check-in
                </button>
              ) : null}
              <motion.button
                type="button"
                onClick={() => send("text")}
                disabled={!body.trim() || isSending}
                aria-label="Envoyer"
                animate={body.trim() ? { scale: 1, boxShadow: "0 0 22px rgba(16,185,129,0.55)" } : { scale: 0.92, boxShadow: "0 0 0px rgba(16,185,129,0)" }}
                whileTap={{ scale: 0.8, rotate: -12 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="lk-shine flex size-10 shrink-0 items-center justify-center rounded-xl bg-lk-blue text-white hover:bg-lk-blue-soft disabled:opacity-30"
              >
                <motion.span animate={isSending ? { x: [0, 6, -2, 0], y: [0, -6, 0, 0] } : { x: 0, y: 0 }} transition={{ duration: 0.5 }}>
                  <Send className="size-4" />
                </motion.span>
              </motion.button>
            </div>
            {body.length > MAX_BODY - 400 ? (
              <p className="mt-1 text-right text-[11px] text-lk-stone-2 tabular-nums">
                {body.length}/{MAX_BODY}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="border-t border-lk-line px-5 py-4 text-center text-sm text-lk-stone-3">
          {meta.pactStatus === "pending" ? "Le pacte attend l'accord de ton partenaire." : "Ce pacte est terminé."}
        </p>
      )}
    </div>
  );
}

function Bubble({
  message,
  first,
  last,
  fresh,
  showName,
  onReply,
  onReact,
  onDelete,
}: {
  message: ChannelMessage;
  first: boolean;
  last: boolean;
  fresh: boolean;
  showName: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const mine = message.mine;
  const pending = message.id < 0;

  if (message.kind === "system") {
    return (
      <p className="lk-rise my-3 text-center text-xs text-lk-stone-3">
        <span className="rounded-full border border-lk-line bg-lk-surface px-3 py-1">{message.body}</span>
      </p>
    );
  }

  return (
    <motion.div
      initial={fresh ? { opacity: 0, y: 14, scale: 0.9 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.7 }}
      style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
      className={cn("group relative flex", mine ? "justify-end" : "justify-start", first ? "mt-3" : "mt-0.5")}
    >
      <div className={cn("flex max-w-[82%] flex-col sm:max-w-[68%]", mine ? "items-end" : "items-start")}>
        {showName && !mine && first ? <span className="mb-0.5 ml-3 text-[11px] text-lk-stone-3">{message.sender.name ?? "Membre"}</span> : null}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Actions du message"
            aria-expanded={open}
            className={cn(
              "text-left text-[15px] leading-relaxed whitespace-pre-wrap break-words transition-all duration-200",
              "px-3.5 py-2",
              message.deleted && "italic opacity-60",
              mine
                ? "bg-lk-blue text-white shadow-[0_6px_20px_-8px_rgba(16,185,129,0.7)]"
                : "lk-glass text-lk-black",
              mine ? (first ? "rounded-t-[20px]" : "rounded-t-[8px]") : first ? "rounded-t-[20px]" : "rounded-t-[8px]",
              mine ? (last ? "rounded-bl-[20px] rounded-br-[6px]" : "rounded-b-[8px]") : last ? "rounded-br-[20px] rounded-bl-[6px]" : "rounded-b-[8px]",
              message.kind === "checkin" && "ring-1 ring-lk-gold/60",
              pending && "opacity-60",
              fresh && !mine && "lk-fresh-glow",
            )}
          >
            {message.kind === "checkin" && !message.deleted ? (
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.2em] text-lk-gold uppercase">Check-in</span>
            ) : null}
            {message.replyTo ? (
              <span className={cn("mb-1.5 block border-l-2 pl-2 text-xs", mine ? "border-white/60 text-white/80" : "border-lk-blue-soft text-lk-stone-3")}>
                <span className="block font-medium">{message.replyTo.senderName ?? "Membre"}</span>
                <span className="line-clamp-2">{message.replyTo.body}</span>
              </span>
            ) : null}
            {message.deleted ? "Message supprimé" : message.body}
          </button>

          <AnimatePresence>
          {open && !message.deleted && !pending ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 480, damping: 30 }}
              className={cn(
                "lk-glass-strong absolute -top-12 z-20 flex items-center gap-0.5 rounded-full px-1.5 py-1",
                mine ? "right-0" : "left-0",
              )}
            >
              {REACTIONS.map((emoji, idx) => (
                <motion.button
                  initial={{ opacity: 0, y: 6, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.025, type: "spring", stiffness: 600, damping: 22 }}
                  whileHover={{ scale: 1.35, y: -3 }}
                  whileTap={{ scale: 0.85 }}
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onReact(emoji);
                    setOpen(false);
                  }}
                  className="flex size-8 items-center justify-center rounded-full text-lg"
                >
                  {emoji}
                </motion.button>
              ))}
              <span className="mx-1 h-5 w-px bg-lk-line" />
              <button
                type="button"
                aria-label="Répondre"
                onClick={() => {
                  onReply();
                  setOpen(false);
                }}
                className="lk-press flex size-8 items-center justify-center rounded-full text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black"
              >
                <CornerUpLeft className="size-4" />
              </button>
              {mine ? (
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                  className="lk-press flex size-8 items-center justify-center rounded-full text-lk-stone-3 hover:bg-lk-coral/15 hover:text-lk-coral"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : (
                <span className="flex size-8 items-center justify-center">
                  <ReportButton targetType="chat_message" targetId={message.id} className="[&>svg]:size-4 [&]:text-lk-stone-3 [&]:normal-case" />
                </span>
              )}
            </motion.div>
          ) : null}
          </AnimatePresence>
        </div>

        {message.reactions.length > 0 && !message.deleted ? (
          <div className={cn("-mt-1.5 flex flex-wrap gap-1", mine ? "mr-2 justify-end" : "ml-2")}>
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => onReact(r.emoji)}
                className={cn(
                  "lk-press lk-pop flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs backdrop-blur-md transition-colors",
                  r.mine ? "border-lk-blue-soft bg-lk-blue/40 text-white" : "border-lk-line bg-[#064e3b]/80 text-lk-black",
                )}
              >
                {r.emoji} <span className="tabular-nums">{r.count}</span>
              </button>
            ))}
          </div>
        ) : null}

        {last ? (
          <span className={cn("mt-0.5 px-2 text-[10px] text-lk-stone-2", mine ? "text-right" : "text-left")}>
            {pending ? "Envoi…" : HOUR.format(new Date(message.createdAt))}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

function ThreadMenu({ meta, others }: { meta: ThreadMeta; others: Person[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const single = meta.kind === "direct" || meta.kind === "pact" ? others[0] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Plus d'options"
        aria-expanded={open}
        className="lk-press rounded-xl p-2 text-lk-stone-3 transition-colors hover:bg-lk-surface hover:text-lk-black"
      >
        <Flag className="size-4" />
      </button>
      {open ? (
        <div className="lk-glass-strong lk-rise absolute right-0 z-30 mt-2 w-60 rounded-2xl p-1.5">
          {single ? (
            <button
              type="button"
              onClick={() =>
                start(async () => {
                  if (!window.confirm(`Bloquer ${single.name ?? "ce membre"} ? Vous ne pourrez plus vous écrire.`)) return;
                  const result = await blockUser(single.id);
                  if (!result.ok) return setError(result.error);
                  setOpen(false);
                  router.push("/dashboard/messages");
                  router.refresh();
                })
              }
              className="lk-press flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-lk-black hover:bg-lk-coral/15 hover:text-lk-coral"
            >
              <Ban className="size-4" /> Bloquer {single.name?.split(" ")[0] ?? "ce membre"}
            </button>
          ) : null}
          {meta.kind === "group" || meta.kind === "room" ? (
            <button
              type="button"
              onClick={() =>
                start(async () => {
                  const result = await leaveConversation(meta.id);
                  if (!result.ok) return setError(result.error);
                  router.push("/dashboard/messages");
                  router.refresh();
                })
              }
              className="lk-press flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-lk-black hover:bg-lk-surface"
            >
              <LogOut className="size-4" /> Quitter la conversation
            </button>
          ) : null}
          <p className="px-3 py-2 text-[11px] leading-snug text-lk-stone-3">Pour signaler un message, touche-le puis le drapeau.</p>
          {error ? <p className="px-3 pb-2 text-xs text-lk-coral">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
