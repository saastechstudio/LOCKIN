import { getOrCreateDbUser } from "@/lib/auth";
import {
  getRecentNotifications,
  getUnreadNotificationsCount,
} from "@/lib/actions/notifications";
import { getTodayFocus } from "@/lib/actions/daily-focus";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MoodGate } from "@/components/dashboard/mood-gate";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // L'audit d'entrée est facultatif : pas de porte ici. Les pages qui
  // s'en servent (accueil, planning, focus du jour) tolèrent son absence.
  const user = await getOrCreateDbUser();

  const [notifications, unreadCount, todayFocus] = await Promise.all([
    getRecentNotifications(),
    getUnreadNotificationsCount(),
    getTodayFocus(),
  ]);

  return (
    <div className="flex min-h-screen bg-lk-white">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        {/* pb-24 : la barre d'onglets mobile ne recouvre pas la fin des pages. */}
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-8 sm:pt-10 md:pb-12">{children}</main>
      </div>
      <MobileTabBar />
      <MoodGate focusId={todayFocus.id} initialMood={todayFocus.mood} />
    </div>
  );
}
