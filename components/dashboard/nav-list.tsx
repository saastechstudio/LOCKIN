"use client";

import Link from "next/link";
import { useId } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_GROUPS, isNavActive } from "@/lib/dashboard-nav";

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

/**
 * Liste de navigation groupée, partagée par la barre latérale et le menu
 * mobile. La pastille de verre et le filet lumineux de l'écran actif
 * glissent d'un lien à l'autre (animation de mise en page partagée) au lieu
 * de sauter : on voit d'où l'on vient.
 */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const group = useId();

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
      {DASHBOARD_NAV_GROUPS.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-2 uppercase">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "lk-press group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                      active ? "font-medium text-lk-black" : "text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black",
                    )}
                  >
                    {active ? (
                      <>
                        <motion.span
                          layoutId={`${group}-pill`}
                          transition={SPRING}
                          className="lk-glass absolute inset-0 rounded-xl"
                        />
                        <motion.span
                          aria-hidden
                          layoutId={`${group}-bar`}
                          transition={SPRING}
                          className="absolute top-1/2 -left-4 h-5 w-[3px] -translate-y-1/2 rounded-full bg-lk-blue-soft shadow-[0_0_12px_rgba(79,154,83,0.9)]"
                        />
                      </>
                    ) : null}
                    <item.icon
                      className={cn(
                        "relative size-4 transition-transform duration-300 group-hover:scale-110",
                        active && "text-lk-blue-soft",
                      )}
                    />
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
