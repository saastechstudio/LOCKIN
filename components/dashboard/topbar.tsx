import { UserButton } from "@clerk/nextjs";

import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import type { Notification, User } from "@/lib/db/schema";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Membre actif", variant: "default" },
  inactive: { label: "Résilié", variant: "secondary" },
};

export function DashboardTopbar({
  user,
  notifications,
  unreadCount,
}: {
  user: User;
  notifications: Notification[];
  unreadCount: number;
}) {
  const firstName = user.name?.split(" ")[0] ?? "Membre";
  const status = user.whopMembershipStatus
    ? STATUS_LABELS[user.whopMembershipStatus]
    : null;

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <p className="font-display truncate text-base text-foreground sm:text-lg">
            {greeting()}, {firstName}
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Verrouille ta concentration. Exécute avec excellence.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Badge variant={status?.variant ?? "outline"} className="hidden sm:inline-flex">
          {status?.label ?? "Aucun abonnement"}
        </Badge>
        <NotificationBell
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
        />
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: { avatarBox: "size-9 ring-1 ring-brand-blue/30 rounded-full" },
          }}
        />
      </div>
    </header>
  );
}
