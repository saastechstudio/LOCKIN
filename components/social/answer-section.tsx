"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { addAnswer, toggleAcceptedAnswer, toggleUseful } from "@/lib/actions/help";
import { ReportButton } from "@/components/moderation/report-button";

type AnswerSectionProps = {
  questionId: number;
  /** L'auteur de la question est seul à pouvoir retenir une réponse. */
  isQuestionAuthor: boolean;
  answers: {
    id: number;
    body: string;
    createdAt: Date;
    user: { id: number; name: string | null };
    usefulByMe: boolean;
    accepted: boolean;
    isMine: boolean;
  }[];
};

/**
 * Réponses d'entraide, sans vote public : chacun peut dire qu'une réponse
 * est utile (le nombre n'est jamais affiché), et l'auteur de la question
 * retient celle qui l'a aidé. Triées côté serveur : retenue, puis utiles.
 */
export function AnswerSection({ questionId, isQuestionAuthor, answers }: AnswerSectionProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const value = body.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      try {
        await addAnswer({ questionId, body: value });
        setBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de publier cette réponse.");
      }
    });
  }

  function handleAccept(answerId: number) {
    setError(null);
    startTransition(async () => {
      try {
        await toggleAcceptedAnswer(answerId, questionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action impossible.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-black/50 uppercase">
        {answers.length} réponse{answers.length > 1 ? "s" : ""}
      </p>

      <div>
        {answers.map((answer) => (
          <div
            key={answer.id}
            className={cn(
              "border-b border-lk-line py-5",
              answer.accepted && "border-l-2 border-l-lk-gold pl-4",
            )}
          >
            {answer.accepted ? (
              <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-lk-gold uppercase">
                <Check className="size-3" /> Réponse retenue
              </p>
            ) : null}
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-lk-black">{answer.body}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="mr-auto text-[11px] tracking-[0.06em] text-lk-black/50 uppercase">
                {answer.user.name ?? "Membre Lockin"}
              </p>
              {isQuestionAuthor && !answer.isMine ? (
                <button
                  type="button"
                  onClick={() => handleAccept(answer.id)}
                  disabled={isPending}
                  className={cn(
                    "border px-3 py-1.5 text-xs font-medium transition-colors",
                    answer.accepted
                      ? "border-lk-gold text-lk-black hover:bg-lk-mist"
                      : "border-lk-black text-lk-black hover:bg-lk-black hover:text-lk-white",
                  )}
                >
                  {answer.accepted ? "Ne plus retenir" : "Retenir cette réponse"}
                </button>
              ) : null}
              {!answer.isMine ? (
                <button
                  type="button"
                  onClick={() => startTransition(() => toggleUseful(answer.id, questionId))}
                  disabled={isPending}
                  aria-pressed={answer.usefulByMe}
                  className={cn(
                    "border px-3 py-1.5 text-xs font-medium transition-colors",
                    answer.usefulByMe
                      ? "border-lk-black bg-lk-black text-lk-white"
                      : "border-lk-line text-lk-black hover:border-lk-black",
                  )}
                >
                  {answer.usefulByMe ? "Utile, noté" : "Utile"}
                </button>
              ) : null}
              <ReportButton targetType="help_answer" targetId={answer.id} />
            </div>
          </div>
        ))}
        {answers.length === 0 ? (
          <p className="text-sm text-lk-black/40">Aucune réponse pour l&apos;instant.</p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-lk-black pt-6">
        {error ? (
          <p className="border-l-2 border-lk-black pl-3 text-sm text-lk-black">{error}</p>
        ) : null}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Proposer une réponse…"
          className="w-full resize-none border border-lk-line bg-lk-white px-4 py-3 text-sm text-lk-black outline-none placeholder:text-lk-black/40 focus:border-lk-black"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !body.trim()}
          className="bg-lk-black px-6 py-3 text-sm font-medium text-lk-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          Répondre
        </button>
      </div>
    </div>
  );
}
