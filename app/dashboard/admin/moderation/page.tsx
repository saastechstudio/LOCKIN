import { getModerationOverview } from "@/lib/actions/moderation";
import { ReportRow } from "@/components/moderation/report-row";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  warning: "Avertissement",
  block_24h: "Blocage 24h",
  suspend_7d: "Suspension 7 jours",
  ban: "Bannissement",
};

const SOURCE_LABELS: Record<string, string> = {
  auto_filter: "Filtrage auto",
  report: "Signalement confirmé",
  manual: "Action manuelle",
};

/** Dashboard de modération — réservé aux comptes isAdmin (requireAdmin dans l'action). */
export default async function ModerationAdminPage() {
  const { pendingReports, recentEvents } = await getModerationOverview();

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
          Lockin Social Club · Admin
        </p>
        <h1 className="font-display mb-2 text-2xl font-bold text-camp-charcoal uppercase">
          Modération
        </h1>
        <p className="mb-8 text-sm text-camp-charcoal/60">
          Respect, discipline, entraide, éthique, focus — charte de modération Lockin.
        </p>

        <section className="mb-12">
          <h2 className="mb-3 font-mono text-xs font-bold tracking-[0.15em] text-camp-charcoal uppercase">
            Signalements en attente ({pendingReports.length})
          </h2>
          {pendingReports.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs text-camp-charcoal/40 uppercase">
              Rien en attente.
            </p>
          ) : (
            <div className="border-t border-camp-hairline">
              {pendingReports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-mono text-xs font-bold tracking-[0.15em] text-camp-charcoal uppercase">
            Derniers événements de modération
          </h2>
          {recentEvents.length === 0 ? (
            <p className="py-6 text-center font-mono text-xs text-camp-charcoal/40 uppercase">
              Aucun événement pour l&apos;instant.
            </p>
          ) : (
            <div className="divide-y divide-camp-hairline border-t border-camp-hairline">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-baseline justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-camp-charcoal">
                      <span className="font-semibold">{event.user.name ?? "Membre Lockin"}</span>{" "}
                      — {SOURCE_LABELS[event.source]} ({event.reason})
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-bold text-camp-gold uppercase">
                    {event.action ? ACTION_LABELS[event.action] : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
