import { UserButton } from "@clerk/nextjs";

import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { LockIcon } from "@/components/lockin/lock-icon";
import type { Notification, User } from "@/lib/db/schema";

function today(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date());
}

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-lk-line bg-lk-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <LockIcon className="h-6 w-[18px] md:hidden" />
        <div className="min-w-0">
          <p className="font-display truncate text-base text-lk-black">{firstName}</p>
          <p className="hidden text-[11px] tracking-[0.2em] text-lk-stone-3 uppercase sm:block">
            {today()}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
        <UserButton appearance={{ elements: { avatarBox: "size-9 rounded-full" } }} />
      </div>
    </header>
  );
}
