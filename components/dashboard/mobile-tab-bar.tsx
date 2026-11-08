"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DASHBOARD_TABS, isNavActive } from "@/lib/dashboard-nav";

/** Barre d'onglets mobile : verre flottant, l'onglet actif s'allume en bleu focus. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="lk-glass-strong fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {DASHBOARD_TABS.map((tab) => {
        const active = isNavActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors",
              active ? "text-lk-black" : "text-lk-stone-3",
            )}
          >
            <tab.icon
              className={cn(
                "size-[18px] transition-all",
                active && "text-lk-blue-soft drop-shadow-[0_0_8px_rgba(74,111,165,0.9)]",
              )}
            />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
