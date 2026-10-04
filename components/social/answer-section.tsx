"use client";

import { useState, useTransition } from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { addAnswer, toggleUpvote } from "@/lib/actions/help";

type AnswerSectionProps = {
  questionId: number;
  answers: {
    id: number;
    body: string;
    createdAt: Date;
    user: { id: number; name: string | null };
    upvoteCount: number;
    upvotedByMe: boolean;
  }[];
};

/** Liste des réponses (triées par upvotes côté serveur) + composeur de nouvelle réponse. */
export function AnswerSection({ questionId, answers }: AnswerSectionProps) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const value = body.trim();
    if (!value) return;
    startTransition(async () => {
      await addAnswer({ questionId, body: value });
      setBody("");
    });
  }

  return (
    <div className="space-y-6">
      <p className="font-mono text-[11px] font-bold tracking-[0.15em] text-camp-gold uppercase">
        {answers.length} réponse{answers.length > 1 ? "s" : ""}
      </p>

      <div className="space-y-5">
        {answers.map((answer, i) => (
          <div
            key={answer.id}
            className={cn("flex gap-4 border-b border-camp-hairline pb-5", i === 0 && answer.upvoteCount > 0 && "bg-camp-cream/50")}
          >
            <button
              type="button"
              onClick={() => startTransition(() => toggleUpvote(answer.id, questionId))}
              disabled={isPending}
              className={cn(
                "flex w-10 shrink-0 flex-col items-center gap-0.5 border py-2 font-mono text-xs font-bold",
                answer.upvotedByMe
                  ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
                  : "border-camp-hairline text-camp-charcoal/60 hover:border-camp-charcoal",
              )}
            >
              <ArrowUp className="size-3.5" />
              {answer.upvoteCount}
            </button>
            <div className="min-w-0 flex-1">
              {i === 0 && answer.upvoteCount > 0 ? (
                <p className="mb-1 font-mono text-[10px] font-bold tracking-[0.1em] text-camp-gold uppercase">
                  Meilleure réponse
                </p>
              ) : null}
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-camp-charcoal">
                {answer.body}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-camp-charcoal/40 uppercase">
                {answer.user.name ?? "Membre Lockin"}
              </p>
            </div>
          </div>
        ))}
        {answers.length === 0 ? (
          <p className="text-sm text-camp-charcoal/40">Aucune réponse pour l&apos;instant.</p>
        ) : null}
      </div>

      <div className="space-y-2 border-t-2 border-camp-charcoal pt-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Proposer une réponse…"
          className="w-full resize-none border border-camp-hairline bg-camp-white px-4 py-3 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !body.trim()}
          className="border-2 border-camp-charcoal bg-camp-gold px-5 py-2 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
        >
          Répondre
        </button>
      </div>
    </div>
  );
}
