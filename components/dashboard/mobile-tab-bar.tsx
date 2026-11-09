"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { DASHBOARD_TABS, isNavActive } from "@/lib/dashboard-nav";

/**
 * Barre d'onglets mobile : verre flottant. La pastille de l'onglet actif
 * glisse d'un onglet à l'autre ; l'icône s'allume en émeraude.
 */
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
              "lk-press relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors",
              active ? "text-lk-black" : "text-lk-stone-3",
            )}
          >
            {active ? (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-1 rounded-xl border border-white/15 bg-white/10"
              />
            ) : null}
            <tab.icon
              className={cn(
                "relative size-[18px] transition-all duration-300",
                active && "-translate-y-0.5 scale-110 text-lk-blue-soft drop-shadow-[0_0_8px_rgba(79,154,83,0.9)]",
              )}
            />
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
