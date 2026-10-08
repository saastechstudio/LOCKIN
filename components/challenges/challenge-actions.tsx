"use client";

import { useState, useTransition } from "react";

import { checkInChallenge, joinChallenge, leaveChallenge } from "@/lib/actions/challenges";
import { Button } from "@/components/ui/button";

type Mine = { checkedToday: boolean; finished: boolean } | null;

/** Rejoindre, valider sa journée, abandonner — une action principale à la fois. */
export function ChallengeActions({ challengeId, mine }: { challengeId: number; mine: Mine }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Action impossible.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {!mine || mine.finished ? (
          <Button disabled={isPending} onClick={() => run(() => joinChallenge(challengeId))}>
            {mine?.finished ? "Recommencer le challenge" : "Rejoindre le challenge"}
          </Button>
        ) : mine.checkedToday ? (
          <Button disabled variant="outline">
            Journée validée
          </Button>
        ) : (
          <Button disabled={isPending} onClick={() => run(() => checkInChallenge(challengeId))}>
            Valider ma journée
          </Button>
        )}
        {mine && !mine.finished ? (
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              if (window.confirm("Abandonner ce challenge ? Tes jours validés seront effacés.")) {
                run(() => leaveChallenge(challengeId));
              }
            }}
          >
            Abandonner
          </Button>
        ) : null}
      </div>
      {error ? <p className="border-l-2 border-lk-line pl-3 text-sm">{error}</p> : null}
    </div>
  );
}
