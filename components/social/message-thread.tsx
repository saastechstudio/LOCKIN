"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { sendMessage } from "@/lib/actions/messages";
import { seemsAggressive } from "@/lib/moderation/filter";
import { ReportButton } from "@/components/moderation/report-button";
import type { Message } from "@/lib/db/schema";

type MessageThreadProps = {
  recipientId: number;
  currentUserId: number;
  thread: Message[];
};

/** Fil de messages — pas de temps réel, l'envoi revalide la page (cohérent avec le reste de l'app). */
export function MessageThread({ recipientId, currentUserId, thread }: MessageThreadProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [respectWarning, setRespectWarning] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    const value = content.trim();
    if (!value) return;

    if (!respectWarning && seemsAggressive(value)) {
      setRespectWarning(true);
      return;
    }

    setError(null);
    setRespectWarning(false);
    startTransition(async () => {
      try {
        await sendMessage({ recipientId, content: value });
        setContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible d'envoyer ce message.");
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3 pb-6">
        {thread.length === 0 ? (
          <p className="py-10 text-center text-xs text-camp-charcoal/50 uppercase">
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
                      "mt-1 text-[10px] uppercase",
                      isMine ? "text-camp-white/50" : "text-camp-charcoal/40",
                    )}
                  >
                    {format(m.createdAt, "d MMM · HH:mm", { locale: fr })}
                  </p>
                </div>
                {!isMine ? (
                  <div className="ml-2 flex items-end">
                    <ReportButton targetType="message" targetId={m.id} />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {respectWarning ? (
        <p className="mb-2 border border-camp-charcoal bg-camp-cream px-3.5 py-2 text-sm text-camp-charcoal">
          Ce message semble agressif. Souhaites-tu le reformuler ? Appuie à nouveau sur
          Envoyer pour l&apos;envoyer tel quel.
        </p>
      ) : null}
      {error ? (
        <p className="mb-2 border border-camp-charcoal bg-camp-cream px-3.5 py-2 text-sm text-camp-charcoal">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 border-t border-camp-charcoal pt-4">
        <input
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setRespectWarning(false);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrire un message…"
          className="flex-1 border border-camp-hairline bg-camp-white px-3.5 py-2.5 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !content.trim()}
          className="border border-camp-charcoal bg-camp-gold px-5 py-2.5 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
