import Link from "next/link";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/lockin/primitives";
import { TripRegistrationActions } from "@/components/club/trip-registration-actions";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { pending: 0, confirmed: 1, cancelled: 2 };
const STATUS_LABELS: Record<string, string> = { pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée" };

/**
 * Places du Lockin Trip — réservé aux comptes isAdmin (requireAdmin).
 * Confirmer une place (paiement reçu) génère le numéro de membre à envoyer
 * par email : c'est lui qui ouvre le club au début du séjour.
 */
export default async function TripAdminPage() {
  await requireAdmin();
  const rows = await db.query.campRegistrations.findMany({
    with: { session: { columns: { name: true, startDate: true } } },
  });
  const sorted = [...rows].sort(
    (a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageHeader
        eyebrow="Admin · Lockin Trip"
        title="Places du Lockin Trip."
        description={`${pending} pré-inscription${pending > 1 ? "s" : ""} en attente. Une fois le paiement reçu, confirme la place : le numéro de membre généré ouvre le club à la personne au début de son séjour. Envoie-le-lui par email.`}
        actions={
          <Link href="/dashboard/admin/moderation" className="lockin-button lockin-button--outline">
            Modération
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <p className="border border-dashed border-lk-line p-8 text-center text-sm text-lk-stone-3">Aucune pré-inscription pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((r) => (
            <li key={r.id} className="border border-lk-line">
              <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-lk-line bg-lk-mist px-5 py-3">
                <div>
                  <p className="font-display text-lg">{r.fullName}</p>
                  <p className="text-xs text-lk-stone-3">
                    {r.email} · {r.session.name} · début le{" "}
                    {r.session.startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                  </p>
                </div>
                <span className="border border-lk-line px-2 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </header>
              <div className="space-y-4 p-5">
                {r.memberNumber ? (
                  <p className="text-sm">
                    Numéro de membre : <span className="font-mono text-base font-semibold tracking-wider">{r.memberNumber}</span>
                  </p>
                ) : null}
                <TripRegistrationActions registrationId={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
