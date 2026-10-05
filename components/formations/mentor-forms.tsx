"use client";

import { useState } from "react";

import { FORMATION_LIMITS } from "@/lib/formations-data";
import { answerMentorQuestion, askMentorQuestion } from "@/lib/actions/formation-mentor";
import { LockinButton, LockinLabel, LockinTextarea } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/**
 * Question disciplinée de l'apprenant : d'abord ce qu'il a déjà essayé,
 * ensuite la question. Les deux champs sont obligatoires — on ne
 * demande pas de l'aide avant d'avoir cherché.
 */
export function AskQuestionForm({
  formationId,
  chapters,
}: {
  formationId: number;
  chapters: { id: number; title: string; moduleTitle: string }[];
}) {
  const { run, pending, error } = useAction();
  const [chapterId, setChapterId] = useState("");
  const [tried, setTried] = useState("");
  const [question, setQuestion] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => askMentorQuestion({ formationId, chapterId: chapterId ? Number(chapterId) : null, tried, question }),
          () => {
            setTried("");
            setQuestion("");
            setChapterId("");
          },
        );
      }}
      className="space-y-5 border border-lk-black p-6"
    >
      <p className="font-display text-lg">Poser une question au mentor</p>
      <div>
        <LockinLabel htmlFor="q-chapter">Chapitre concerné (facultatif)</LockinLabel>
        <select id="q-chapter" className="lockin-input" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
          <option value="">Toute la formation</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.moduleTitle} · {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <LockinLabel htmlFor="q-tried">Ce que j&apos;ai déjà essayé</LockinLabel>
        <LockinTextarea id="q-tried" value={tried} onChange={(e) => setTried(e.target.value)} rows={3} maxLength={FORMATION_LIMITS.question} required />
      </div>
      <div>
        <LockinLabel htmlFor="q-question">Ma question</LockinLabel>
        <LockinTextarea
          id="q-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={FORMATION_LIMITS.question}
          required
        />
      </div>
      <FormError message={error} />
      <LockinButton type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer au mentor"}
      </LockinButton>
    </form>
  );
}

/** Réponse structurée du mentor : une réponse, puis la prochaine action concrète. */
export function AnswerForm({ questionId }: { questionId: number }) {
  const { run, pending, error } = useAction();
  const [answer, setAnswer] = useState("");
  const [nextAction, setNextAction] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => answerMentorQuestion({ questionId, answer, nextAction }));
      }}
      className="space-y-4 border border-lk-black p-5"
    >
      <div>
        <LockinLabel htmlFor={`a-${questionId}`}>Réponse</LockinLabel>
        <LockinTextarea id={`a-${questionId}`} value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} maxLength={FORMATION_LIMITS.answer} required />
      </div>
      <div>
        <LockinLabel htmlFor={`n-${questionId}`}>Prochaine action</LockinLabel>
        <LockinTextarea
          id={`n-${questionId}`}
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Une seule chose concrète à faire maintenant."
          required
        />
      </div>
      <FormError message={error} />
      <LockinButton type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Répondre"}
      </LockinButton>
    </form>
  );
}
