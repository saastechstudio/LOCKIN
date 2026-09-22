import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { onboardingAudits } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { hasPremiumAccess, requiresSubscription } from "@/lib/premium";
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
  const user = await getOrCreateDbUser();

  if (requiresSubscription() && !hasPremiumAccess(user)) {
    redirect("/subscribe");
  }

  // The audit is the mandatory first step of La Méthode Lock In — a member
  // landing here (deep link, back button, bookmarked URL) without having
  // completed it yet gets sent back to the real onboarding flow rather
  // than seeing an empty/broken dashboard.
  const completedAudit = await db.query.onboardingAudits.findFirst({
    where: eq(onboardingAudits.userId, user.id),
    columns: { id: true },
  });
  if (!completedAudit) {
    redirect("/onboarding");
  }

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
