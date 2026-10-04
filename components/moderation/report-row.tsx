"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { resolveReport } from "@/lib/actions/moderation";

const REASON_LABELS: Record<string, string> = {
  insulte: "Insulte",
  harcelement: "Harcèlement",
  discrimination: "Discrimination",
  spam: "Spam",
  autre: "Autre",
};

const TARGET_LABELS: Record<string, string> = {
  post: "Post",
  comment: "Commentaire",
  message: "Message privé",
  help_answer: "Réponse entraide",
};

type ReportRowProps = {
  report: {
    id: number;
    targetType: "post" | "comment" | "message" | "help_answer";
    targetId: number;
    reason: string;
    details: string | null;
    createdAt: Date;
    reporter: { id: number; name: string | null };
    reportedUser: { id: number; name: string | null; strikeCount: number; respectScore: number };
  };
};

/** Ligne de triage — "Confirmer" applique le strike suivant et supprime le contenu, "Rejeter" classe sans suite. */
export function ReportRow({ report }: ReportRowProps) {
  const [resolved, setResolved] = useState<"uphold" | "dismiss" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handle(decision: "uphold" | "dismiss") {
    startTransition(async () => {
      await resolveReport({ reportId: report.id, decision });
      setResolved(decision);
    });
  }

  return (
    <div className="border-b border-camp-hairline py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-xs font-bold tracking-[0.06em] text-camp-charcoal uppercase">
          {TARGET_LABELS[report.targetType]} #{report.targetId} · {REASON_LABELS[report.reason]}
        </p>
        <span className="font-mono text-[11px] text-camp-charcoal/40 uppercase">
          {formatDistanceToNow(report.createdAt, { addSuffix: true, locale: fr })}
        </span>
      </div>

      <p className="mt-1 text-sm text-camp-charcoal/70">
        Signalé par {report.reporter.name ?? "Membre Lockin"} · visant{" "}
        <span className="font-semibold text-camp-charcoal">{report.reportedUser.name ?? "Membre Lockin"}</span>{" "}
        ({report.reportedUser.strikeCount} strike{report.reportedUser.strikeCount > 1 ? "s" : ""}, score{" "}
        {report.reportedUser.respectScore})
      </p>

      {report.details ? (
        <p className="mt-1 border border-camp-hairline bg-camp-cream px-3 py-2 text-sm text-camp-charcoal/80">
          {report.details}
        </p>
      ) : null}

      {resolved ? (
        <p className="mt-2 font-mono text-[11px] font-bold text-camp-gold uppercase">
          {resolved === "uphold" ? "Confirmé — strike appliqué" : "Rejeté"}
        </p>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handle("uphold")}
            disabled={isPending}
            className="border-2 border-camp-charcoal bg-camp-charcoal px-4 py-1.5 font-mono text-[11px] font-bold text-camp-white uppercase disabled:opacity-40"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => handle("dismiss")}
            disabled={isPending}
            className="border border-camp-hairline px-4 py-1.5 font-mono text-[11px] font-bold text-camp-charcoal/70 uppercase hover:border-camp-charcoal disabled:opacity-40"
          >
            Rejeter
          </button>
        </div>
      )}
    </div>
  );
}
