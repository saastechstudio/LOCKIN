import { MentorMessage } from "@/components/formations/mentor-message";

export type MentorQuestionView = {
  id: number;
  learner: { id: number; name: string | null };
  chapter: { id: number; title: string } | null;
  tried: string;
  question: string;
  answer: string | null;
  nextAction: string | null;
  createdAt: Date;
  answeredAt: Date | null;
};

/**
 * Un échange : la question structurée de l'apprenant, puis la réponse
 * structurée du mentor — ou l'attente, avec le formulaire de réponse
 * (`reply`) que la page fournit au mentor.
 */
export function MentorThread({
  question,
  mentorName,
  reply,
}: {
  question: MentorQuestionView;
  mentorName: string;
  reply?: React.ReactNode;
}) {
  const answered = Boolean(question.answeredAt && question.answer);
  return (
    <article className="space-y-px">
      {question.chapter ? (
        <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-gold uppercase">
          Chapitre · {question.chapter.title}
        </p>
      ) : null}
      <MentorMessage
        author={question.learner.name ?? "Membre Lockin"}
        role="apprenant"
        date={question.createdAt}
        blocks={[
          { label: "Ce que j'ai essayé", text: question.tried },
          { label: "Ma question", text: question.question },
        ]}
      />
      {answered ? (
        <MentorMessage
          author={mentorName}
          role="mentor"
          date={question.answeredAt}
          blocks={[
            { label: "Réponse", text: question.answer ?? "" },
            { label: "Prochaine action", text: question.nextAction ?? "" },
          ]}
        />
      ) : (
        <div className="border border-dashed border-lk-black/40 p-5 text-sm text-lk-black/60">
          En attente de réponse du mentor.
        </div>
      )}
      {reply}
    </article>
  );
}
