import { getOrCreateDbUser } from "@/lib/auth";
import { getRecentNotifications, getUnreadNotificationsCount } from "@/lib/actions/notifications";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";

/**
 * Coque du module Formation : la même que l'espace membre (barre
 * latérale, barre du haut, onglets mobile) pour que « Formations » soit
 * un écran de l'app et non un site à part. Page réservée aux connectés
 * (proxy.ts) ; l'adhésion au club est vérifiée page par page.
 */
export default async function FormationsLayout({ children }: { children: React.ReactNode }) {
  const user = await getOrCreateDbUser();
  const [notifications, unreadCount] = await Promise.all([getRecentNotifications(), getUnreadNotificationsCount()]);

  return (
    <div className="flex min-h-screen bg-lk-white">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar user={user} notifications={notifications} unreadCount={unreadCount} />
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-8 sm:pt-10 md:pb-12">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
