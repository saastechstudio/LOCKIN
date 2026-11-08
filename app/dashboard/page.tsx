import { getOrCreateDbUser } from "@/lib/auth";
import { getTodayFocus } from "@/lib/actions/daily-focus";
import { loadLifeOs } from "@/lib/life-os/snapshot";
import { fallbackEvening, fallbackMorning } from "@/lib/copilot/briefing";
import { CockpitView } from "@/components/cockpit/cockpit-view";

export const dynamic = "force-dynamic";

/** Le cockpit Life OS : la première chose que le membre voit en ouvrant LockIn. */
export default async function DashboardPage() {
  const user = await getOrCreateDbUser();
  // Crée la priorité du jour si besoin, avant de charger l'instantané qui la lit.
  const focusRow = await getTodayFocus();
  const snapshot = await loadLifeOs(user);

  return (
    <CockpitView
      snapshot={snapshot}
      fallback={{ morning: fallbackMorning(snapshot), evening: fallbackEvening(snapshot) }}
      focusRow={focusRow}
    />
  );
}
