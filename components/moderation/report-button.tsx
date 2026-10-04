"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";

import { reportContent } from "@/lib/actions/moderation";
import { cn } from "@/lib/utils";

const REASONS = [
  { value: "insulte", label: "Insulte" },
  { value: "harcelement", label: "Harcèlement" },
  { value: "discrimination", label: "Discrimination" },
  { value: "spam", label: "Spam" },
  { value: "autre", label: "Autre" },
] as const;

type ReportButtonProps = {
  targetType: "post" | "comment" | "message" | "help_answer";
  targetId: number;
  className?: string;
};

/** Bouton "Signaler" discret — posts, commentaires, messages, réponses d'entraide. */
export function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("insulte");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <span className={cn("font-mono text-[11px] text-camp-charcoal/40 uppercase", className)}>
        Signalement envoyé
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[11px] text-camp-charcoal/40 uppercase hover:text-camp-charcoal",
          className,
        )}
      >
        <Flag className="size-3" /> Signaler
      </button>
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await reportContent({ targetType, targetId, reason, details: details.trim() || undefined });
        setSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible d'envoyer ce signalement.");
      }
    });
  }

  return (
    <div className={cn("border border-camp-hairline bg-camp-cream p-3", className)}>
      <p className="mb-2 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase">
        Signaler ce contenu
      </p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as typeof reason)}
        className="w-full border border-camp-hairline bg-camp-white px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal uppercase outline-none"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Détails (optionnel)"
        className="mt-2 w-full resize-none border border-camp-hairline bg-camp-white px-2.5 py-2 text-xs text-camp-charcoal outline-none placeholder:text-camp-charcoal/40"
      />
      {error ? <p className="mt-2 text-xs text-camp-charcoal">{error}</p> : null}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="border-2 border-camp-charcoal bg-camp-charcoal px-3 py-1.5 font-mono text-[11px] font-bold text-camp-white uppercase disabled:opacity-40"
        >
          Envoyer
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[11px] text-camp-charcoal/50 uppercase hover:text-camp-charcoal"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
