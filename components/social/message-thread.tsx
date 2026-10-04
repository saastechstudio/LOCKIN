"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/actions/messages";
import type { Message } from "@/lib/db/schema";

type MessageThreadProps = {
  recipientId: number;
  currentUserId: number;
  thread: Message[];
};

/** Fil de messages — pas de temps réel, l'envoi revalide la page (cohérent avec le reste de l'app). */
export function MessageThread({ recipientId, currentUserId, thread }: MessageThreadProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const value = content.trim();
    if (!value) return;
    startTransition(async () => {
      await sendMessage({ recipientId, content: value });
      setContent("");
    });
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3 pb-6">
        {thread.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-camp-charcoal/50 uppercase">
            Aucun message — commence la conversation.
          </p>
        ) : (
          thread.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] border px-3.5 py-2.5",
                    isMine
                      ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
                      : "border-camp-hairline text-camp-charcoal",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[10px] uppercase",
                      isMine ? "text-camp-white/50" : "text-camp-charcoal/40",
                    )}
                  >
                    {format(m.createdAt, "d MMM · HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 border-t-2 border-camp-charcoal pt-4">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrire un message…"
          className="flex-1 border border-camp-hairline bg-camp-white px-3.5 py-2.5 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          className="border-2 border-camp-charcoal bg-camp-gold px-5 py-2.5 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
