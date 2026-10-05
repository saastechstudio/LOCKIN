"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DASHBOARD_TABS, isNavActive } from "@/lib/dashboard-nav";

/** Barre d'onglets fixe en bas d'écran sur mobile : cinq cases carrées, l'active en noir. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-lk-black bg-lk-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {DASHBOARD_TABS.map((tab) => {
        const active = isNavActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 border-t-2 text-[10px] font-medium tracking-wide uppercase",
              active ? "border-lk-teal bg-lk-black text-lk-white" : "border-transparent text-lk-black/60",
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
