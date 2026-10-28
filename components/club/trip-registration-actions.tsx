"use client";

import { useRouter } from "next/navigation";

import { cancelTripRegistration, confirmTripRegistration } from "@/lib/actions/club-access";
import { LockinButton } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/** Confirmer une place (génère le numéro de membre) ou l'annuler. */
export function TripRegistrationActions({ registrationId, status }: { registrationId: number; status: string }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const done = () => router.refresh();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {status !== "confirmed" ? (
          <LockinButton disabled={pending} onClick={() => run(() => confirmTripRegistration(registrationId), done)}>
            Confirmer et générer le numéro
          </LockinButton>
        ) : null}
        {status !== "cancelled" ? (
          <LockinButton
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (window.confirm("Annuler cette pré-inscription ?")) run(() => cancelTripRegistration(registrationId), done);
            }}
          >
            Annuler
          </LockinButton>
        ) : null}
      </div>
      <FormError message={error} />
    </div>
  );
}
