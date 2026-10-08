import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getMentorView } from "@/lib/formations-queries";
import { Eyebrow, PageHeader } from "@/components/lockin/primitives";
import { AnswerForm, AskQuestionForm } from "@/components/formations/mentor-forms";
import { MentorThread } from "@/components/formations/mentor-thread";

export const dynamic = "force-dynamic";

export default async function MentorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formationId = Number(id);
  if (!Number.isInteger(formationId)) notFound();
  const user = await requireLockinOnboarded(`/formations/${formationId}/mentor`);

  const view = await getMentorView(formationId, user.id);
  if (!view) notFound();

  const back = (
    <Link href={`/formations/${formationId}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-stone-3 hover:text-lk-black">
      <ArrowLeft className="size-3.5" /> {view.formation.title}
    </Link>
  );

  if (view.role === "outsider") {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {back}
        <PageHeader eyebrow="Mode mentor" title="Commence d'abord la formation." description="Le mentor répond aux apprenants inscrits." />
        <Link href={`/formations/${formationId}`} className="lockin-button">
          Voir la formation
        </Link>
      </div>
    );
  }

  const isMentor = view.role === "mentor";

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {back}
      <PageHeader
        eyebrow="Mode mentor"
        title={isMentor ? "Les questions de tes apprenants." : "Une question, bien posée."}
        description={
          isMentor
            ? `${view.pendingCount} question${view.pendingCount > 1 ? "s" : ""} en attente. Réponds, puis donne une seule action concrète.`
            : "Dis ce que tu as déjà essayé, puis ce que tu demandes. Le mentor répond par une réponse et une prochaine action. Ici, pas de likes : on avance."
        }
      />

      {isMentor ? null : <AskQuestionForm formationId={formationId} chapters={view.chapters} />}

      <section className="space-y-10">
        <Eyebrow>{isMentor ? "Questions" : "Mes questions"}</Eyebrow>
        {view.questions.length === 0 ? (
          <p className="border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">
            {isMentor ? "Aucune question pour l'instant." : "Tu n'as pas encore posé de question."}
          </p>
        ) : (
          view.questions.map((q) => (
            <MentorThread
              key={q.id}
              question={q}
              mentorName={view.formation.creatorName ?? "Mentor"}
              reply={isMentor && !q.answeredAt ? <AnswerForm questionId={q.id} /> : undefined}
            />
          ))
        )}
      </section>
    </div>
  );
}
