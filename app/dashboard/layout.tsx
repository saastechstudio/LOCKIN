import { redirect } from "next/navigation";

import { getOrCreateDbUser } from "@/lib/auth";
import { hasPremiumAccess, requiresSubscription } from "@/lib/premium";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateDbUser();

  if (requiresSubscription() && !hasPremiumAccess(user)) {
    redirect("/subscribe");
  }

  return (
    <div className="flex min-h-screen bg-background bg-noise">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar user={user} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
