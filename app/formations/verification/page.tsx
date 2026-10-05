import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getCreatorVerification } from "@/lib/creator-verification";
import { PageHeader } from "@/components/lockin/primitives";
import { LockinSection } from "@/components/lockin/lockin-ui";
import { VerificationForm } from "@/components/formations/verification-form";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const user = await requireLockinOnboarded("/formations/verification");
  const v = await getCreatorVerification(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link href="/formations" className="inline-flex items-center gap-1.5 text-xs font-medium text-lk-black/60 hover:text-lk-black">
        <ArrowLeft className="size-3.5" /> Formations
      </Link>
      <PageHeader
        eyebrow="Créateur vérifié"
        title="Transmettre exige d'être identifié."
        description="Avant de publier une formation, un administrateur valide qui tu es. Tu peux créer et préparer tes formations en brouillon dès maintenant : seule la publication est soumise à cette validation."
      />

      {v.status === "approved" ? (
        <LockinSection className="space-y-4">
          <p className="font-display text-xl">Tu es créateur vérifié.</p>
          <p className="text-sm text-lk-black/70">Ton identité a été validée : tu peux publier tes formations.</p>
          <Link href="/formations" className="lockin-button">
            Voir mes formations
          </Link>
        </LockinSection>
      ) : v.status === "pending" ? (
        <LockinSection className="space-y-3">
          <p className="font-display text-xl">Demande en cours d&apos;examen.</p>
          <p className="text-sm leading-relaxed text-lk-black/70">
            Un administrateur examine ta demande, et peut te contacter par message pour la compléter. Tu seras prévenu dans
            l&apos;app dès qu&apos;il aura décidé.
          </p>
        </LockinSection>
      ) : (
        <>
          {v.status === "rejected" ? (
            <div className="space-y-2 border border-lk-black bg-lk-mist p-5">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-black/60 uppercase">Demande refusée</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{v.decisionNote ?? "Aucun motif indiqué."}</p>
              <p className="text-xs text-lk-black/60">Corrige ta demande ci-dessous et renvoie-la.</p>
            </div>
          ) : null}
          <LockinSection>
            <VerificationForm initial={{ legalName: v.legalName, presentation: v.presentation, proofUrl: v.proofUrl }} />
          </LockinSection>
          <p className="text-xs leading-relaxed text-lk-black/50">
            Ces informations ne sont visibles que des administrateurs de Lockin. Aucun document d&apos;identité n&apos;est
            demandé ni conservé : seule la décision est enregistrée. Voir la{" "}
            <Link href="/legal/confidentialite" className="underline underline-offset-4">
              politique de confidentialité
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
