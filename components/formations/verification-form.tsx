"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { submitCreatorVerification } from "@/lib/actions/creator-verification";
import { CREATOR_VERIFICATION_LIMITS as L } from "@/lib/formations-data";
import { LockinButton, LockinInput, LockinLabel, LockinTextarea } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/** Demande de vérification d'identité : nom réel, présentation, lien de preuve, certification. */
export function VerificationForm({
  initial,
}: {
  initial: { legalName: string; presentation: string; proofUrl: string };
}) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const [legalName, setLegalName] = useState(initial.legalName);
  const [presentation, setPresentation] = useState(initial.presentation);
  const [proofUrl, setProofUrl] = useState(initial.proofUrl);
  const [certified, setCertified] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => submitCreatorVerification({ legalName, presentation, proofUrl, certified: certified as true }),
          () => router.refresh(),
        );
      }}
      className="space-y-6"
    >
      <div>
        <LockinLabel htmlFor="v-name">Prénom et nom</LockinLabel>
        <LockinInput
          id="v-name"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          maxLength={L.legalName}
          autoComplete="name"
          required
          placeholder="Tels qu'ils figurent sur ta pièce d'identité"
        />
      </div>
      <div>
        <LockinLabel htmlFor="v-pres">Ton expertise</LockinLabel>
        <LockinTextarea
          id="v-pres"
          value={presentation}
          onChange={(e) => setPresentation(e.target.value)}
          maxLength={L.presentation}
          rows={5}
          required
          placeholder="Ce que tu sais faire, depuis quand, avec quels résultats. Ce que tu enseignes doit venir de ce que tu as vécu."
        />
        <p className="mt-2 text-xs text-lk-black/50 tabular-nums">
          {presentation.trim().length}/{L.presentation} · {L.presentationMin} caractères minimum
        </p>
      </div>
      <div>
        <LockinLabel htmlFor="v-proof">Lien de preuve</LockinLabel>
        <LockinInput
          id="v-proof"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          maxLength={L.proofUrl}
          inputMode="url"
          required
          placeholder="https://linkedin.com/in/… ou ton site, ton portfolio"
        />
        <p className="mt-2 text-xs text-lk-black/50">Un profil public où l&apos;on peut vérifier qui tu es et ce que tu fais.</p>
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          checked={certified}
          onChange={(e) => setCertified(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-black"
          required
        />
        <span>Je certifie que ces informations sont exactes et qu&apos;elles ne concernent que moi.</span>
      </label>

      <FormError message={error} />
      <LockinButton type="submit" disabled={pending || !certified}>
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </LockinButton>
    </form>
  );
}
