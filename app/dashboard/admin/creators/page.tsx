import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isHttpsUrl } from "@/lib/safe-url";
import { CREATOR_STATUS_LABELS, type CreatorStatus } from "@/lib/formations-data";
import { Eyebrow, PageHeader } from "@/components/lockin/primitives";
import { CreatorDecision } from "@/components/formations/creator-decision";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };

/** Examen des demandes de créateur vérifié — réservé aux comptes isAdmin (requireAdmin). */
export default async function CreatorsAdminPage() {
  await requireAdmin();
  const rows = await db.query.creatorVerifications.findMany({
    with: { user: { columns: { id: true, name: true, email: true } } },
  });
  const sorted = [...rows].sort(
    (a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageHeader
        eyebrow="Admin · Créateurs"
        title="Vérification des créateurs."
        description={`${pending} demande${pending > 1 ? "s" : ""} en attente. Vérifie le lien de preuve, contacte la personne par message si besoin, puis décide. Aucun document d'identité n'est stocké.`}
        actions={
          <Link href="/dashboard/admin/moderation" className="lockin-button lockin-button--outline">
            Modération
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <p className="border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">Aucune demande pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-6">
          {sorted.map((v) => (
            <li key={v.id} className="border border-lk-line">
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-lk-line bg-lk-mist px-5 py-3">
                <div>
                  <p className="font-display text-lg">{v.legalName}</p>
                  <p className="text-xs text-lk-stone-3">
                    Compte : {v.user.name ?? "—"} · {v.user.email} ·{" "}
                    <Link href={`/dashboard/messages/${v.user.id}`} className="underline underline-offset-4">
                      Écrire
                    </Link>
                  </p>
                </div>
                <span className="border border-lk-line px-2 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
                  {CREATOR_STATUS_LABELS[v.status as CreatorStatus] ?? v.status}
                </span>
              </header>
              <div className="space-y-4 p-5">
                <div>
                  <Eyebrow>Expertise</Eyebrow>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{v.presentation}</p>
                </div>
                <div>
                  <Eyebrow>Lien de preuve</Eyebrow>
                  {isHttpsUrl(v.proofUrl) ? (
                    <a
                      href={v.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-2 block text-sm break-all underline underline-offset-4"
                    >
                      {v.proofUrl}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-lk-stone-3">Lien invalide.</p>
                  )}
                </div>
                {v.decisionNote ? (
                  <p className="border-l-2 border-lk-line pl-3 text-sm text-lk-black/70">Motif : {v.decisionNote}</p>
                ) : null}
                <p className="text-xs text-lk-stone-3">
                  Demande {formatDistanceToNow(v.createdAt, { addSuffix: true, locale: fr })}
                </p>
                <CreatorDecision verificationId={v.id} status={v.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
