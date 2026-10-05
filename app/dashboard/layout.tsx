import { getOrCreateDbUser } from "@/lib/auth";
import {
  getRecentNotifications,
  getUnreadNotificationsCount,
} from "@/lib/actions/notifications";
import { getTodayFocus } from "@/lib/actions/daily-focus";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MoodGate } from "@/components/dashboard/mood-gate";

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
    <div className="flex min-h-screen bg-background bg-noise">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
      <MoodGate focusId={todayFocus.id} initialMood={todayFocus.mood} />
    </div>
  );
}
