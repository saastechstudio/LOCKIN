import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

import { getQuestions } from "@/lib/actions/help";
import { LOCKIN_TAGS } from "@/lib/social/data";
import { QuestionComposer } from "@/components/social/question-composer";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EntraidePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const questions = await getQuestions(tag);

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
          Lockin Social Club
        </p>
        <h1 className="font-display mb-1 text-2xl font-bold text-camp-charcoal uppercase">
          Entraide
        </h1>
        <p className="mb-6 text-sm text-camp-charcoal/60">
          Questions, réponses, feedback — on avance ensemble.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterPill href="/dashboard/entraide" active={!tag}>
            Tout
          </FilterPill>
          {LOCKIN_TAGS.map((t) => (
            <FilterPill key={t} href={`/dashboard/entraide?tag=${t}`} active={tag === t}>
              {t}
            </FilterPill>
          ))}
        </div>

        <QuestionComposer />

        <div className="divide-y divide-camp-hairline">
          {questions.length === 0 ? (
            <p className="py-10 text-center font-mono text-xs text-camp-charcoal/50 uppercase">
              Aucune question pour l&apos;instant.
            </p>
          ) : (
            questions.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/entraide/${q.id}`}
                className="block py-4 hover:bg-camp-cream"
              >
                <p className="text-sm font-medium text-camp-charcoal">{q.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {q.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] font-bold tracking-[0.06em] text-camp-gold uppercase"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="font-mono text-[11px] text-camp-charcoal/40">
                    {q.user.name ?? "Membre Lockin"} ·{" "}
                    {formatDistanceToNow(q.createdAt, { addSuffix: true, locale: fr })}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-camp-charcoal/40">
                    <MessageCircle className="size-3.5" /> {q.answerCount}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] uppercase transition-colors",
        active
          ? "border-camp-charcoal bg-camp-charcoal text-camp-white"
          : "border-camp-hairline text-camp-charcoal/70 hover:border-camp-charcoal hover:text-camp-charcoal",
      )}
    >
      {children}
    </Link>
  );
}
