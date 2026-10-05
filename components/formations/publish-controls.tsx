"use client";

import { useRouter } from "next/navigation";

import { deleteFormation, publishFormation, unpublishFormation } from "@/lib/actions/formations";
import { LockinButton } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/** Publier / dépublier / supprimer — les trois actions sensibles du créateur, réunies. */
export function PublishControls({
  formationId,
  published,
  canPublish,
}: {
  formationId: number;
  published: boolean;
  /** Créateur vérifié ? Sinon la publication est bloquée (et refusée côté serveur). */
  canPublish: boolean;
}) {
  const router = useRouter();
  const { run, pending, error } = useAction();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {published ? (
          <LockinButton variant="outline" disabled={pending} onClick={() => run(() => unpublishFormation(formationId))}>
            Repasser en brouillon
          </LockinButton>
        ) : (
          <LockinButton disabled={pending || !canPublish} onClick={() => run(() => publishFormation(formationId))}>
            Publier la formation
          </LockinButton>
        )}
        <LockinButton
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Supprimer définitivement cette formation, ses modules et la progression des apprenants ?")) {
              run(() => deleteFormation(formationId), () => router.push("/formations"));
            }
          }}
        >
          Supprimer
        </LockinButton>
      </div>
      <FormError message={error} />
    </div>
  );
}
