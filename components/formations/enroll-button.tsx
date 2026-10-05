"use client";

import { enrollInFormation } from "@/lib/actions/formations";
import { LockinButton } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/** « Commencer » : inscrit le membre. L'accès aux ressources s'ouvre à l'inscription. */
export function EnrollButton({ formationId, label = "Commencer" }: { formationId: number; label?: string }) {
  const { run, pending, error } = useAction();
  return (
    <div className="space-y-3">
      <LockinButton disabled={pending} onClick={() => run(() => enrollInFormation(formationId))}>
        {pending ? "Inscription…" : label}
      </LockinButton>
      <FormError message={error} />
    </div>
  );
}
