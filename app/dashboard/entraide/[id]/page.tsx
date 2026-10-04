import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getQuestion } from "@/lib/actions/help";
import { AnswerSection } from "@/components/social/answer-section";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireLockinOnboarded();
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isInteger(questionId)) notFound();

  const question = await getQuestion(questionId);
  if (!question) notFound();

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/entraide"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal/60 uppercase hover:text-camp-charcoal"
        >
          <ArrowLeft className="size-3.5" /> Entraide
        </Link>

        <div className="mb-8 border-b-2 border-camp-charcoal pb-6">
          <div className="mb-2 flex flex-wrap gap-2">
            {question.tags.map((t) => (
              <span
                key={t}
                className="border border-camp-hairline px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.06em] text-camp-gold uppercase"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-xl font-bold text-camp-charcoal">{question.title}</h1>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-camp-charcoal/80">
            {question.body}
          </p>
          <p className="mt-3 font-mono text-[11px] text-camp-charcoal/40 uppercase">
            Posée par {question.user.name ?? "Membre Lockin"}
          </p>
        </div>

        <AnswerSection questionId={question.id} answers={question.answers} />
      </div>
    </div>
  );
}
