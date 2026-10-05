"use client";

import { useState } from "react";

import { decideCreatorVerification } from "@/lib/actions/creator-verification";
import { CREATOR_VERIFICATION_LIMITS as L } from "@/lib/formations-data";
import { LockinButton, LockinTextarea } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/**
 * Décision d'un administrateur sur une demande. Refuser ou retirer exige un
 * motif, montré au membre ; retirer remet ses formations en brouillon.
 */
export function CreatorDecision({ verificationId, status }: { verificationId: number; status: string }) {
  const { run, pending, error } = useAction();
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState<null | "reject" | "revoke">(null);

  const decide = (decision: "approve" | "reject" | "revoke") =>
    run(() => decideCreatorVerification({ verificationId, decision, note }), () => {
      setAsking(null);
      setNote("");
    });

  return (
    <div className="space-y-3">
      {asking ? (
        <div className="space-y-3">
          <LockinTextarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={L.decisionNote}
            rows={3}
            aria-label="Motif, montré au membre"
            placeholder={
              asking === "reject"
                ? "Motif du refus, montré au membre : ce qu'il doit corriger."
                : "Motif du retrait, montré au membre. Ses formations repassent en brouillon."
            }
          />
          <div className="flex gap-3">
            <LockinButton disabled={pending || note.trim().length < 5} onClick={() => decide(asking)}>
              {asking === "reject" ? "Confirmer le refus" : "Confirmer le retrait"}
            </LockinButton>
            <LockinButton variant="outline" onClick={() => setAsking(null)}>
              Annuler
            </LockinButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {status !== "approved" ? (
            <LockinButton disabled={pending} onClick={() => decide("approve")}>
              Approuver
            </LockinButton>
          ) : null}
          {status === "pending" ? (
            <LockinButton variant="outline" onClick={() => setAsking("reject")}>
              Refuser
            </LockinButton>
          ) : null}
          {status === "approved" ? (
            <LockinButton variant="outline" onClick={() => setAsking("revoke")}>
              Retirer la vérification
            </LockinButton>
          ) : null}
        </div>
      )}
      <FormError message={error} />
    </div>
  );
}
