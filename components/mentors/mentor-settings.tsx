"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { LOCKIN_TAGS, type LockinTag } from "@/lib/social/data";
import { updateMentorProfile } from "@/lib/actions/mentors";
import { Button } from "@/components/ui/button";

/** Activer le Mode Mentor : domaines (4 max) + quelques mots sur ce qu'on peut apporter. */
export function MentorSettings({
  initial,
}: {
  initial: { isMentor: boolean; domains: string[]; pitch: string };
}) {
  const [isMentor, setIsMentor] = useState(initial.isMentor);
  const [domains, setDomains] = useState<LockinTag[]>(
    initial.domains.filter((d): d is LockinTag => (LOCKIN_TAGS as readonly string[]).includes(d)),
  );
  const [pitch, setPitch] = useState(initial.pitch);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleDomain(tag: LockinTag) {
    setDomains((prev) =>
      prev.includes(tag) ? prev.filter((d) => d !== tag) : prev.length < 4 ? [...prev, tag] : prev,
    );
  }

  function save(nextIsMentor: boolean) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateMentorProfile({ isMentor: nextIsMentor, domains, pitch });
        setIsMentor(nextIsMentor);
        setMessage(nextIsMentor ? "Tu apparais dans l'annuaire des mentors." : "Mode Mentor désactivé.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Enregistrement impossible.");
      }
    });
  }

  return (
    <div className="space-y-5 border border-lk-line p-6">
      <div>
        <p className="font-display text-lg">{isMentor ? "Tu es mentor" : "Devenir mentor"}</p>
        <p className="mt-1 text-sm text-lk-stone-3">
          Bénévole. Tu guides d&apos;autres membres dans les domaines où tu as déjà mené ton combat.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LOCKIN_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleDomain(tag)}
            aria-pressed={domains.includes(tag)}
            className={cn(
              "border px-3 py-1.5 text-xs font-medium transition-colors",
              domains.includes(tag)
                ? "border-lk-line bg-lk-black text-lk-white"
                : "border-lk-line hover:border-lk-line",
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <textarea
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
        maxLength={400}
        rows={3}
        placeholder="Ce que tu peux apporter, en deux phrases."
        className="w-full resize-none border border-lk-line px-4 py-3 text-sm outline-none placeholder:text-lk-black/40 focus:border-lk-line"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isPending} onClick={() => save(true)}>
          {isMentor ? "Mettre à jour" : "Activer le Mode Mentor"}
        </Button>
        {isMentor ? (
          <Button variant="ghost" disabled={isPending} onClick={() => save(false)}>
            Désactiver
          </Button>
        ) : null}
        {message ? <p className="text-sm text-lk-stone-3">{message}</p> : null}
      </div>
    </div>
  );
}
