"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_GROUPS, isNavActive } from "@/lib/dashboard-nav";

/** Liste de navigation groupée, partagée par la barre latérale et le menu mobile. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
      {DASHBOARD_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-stone-2 uppercase">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                      active
                        ? "lk-glass font-medium text-lk-black"
                        : "text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -left-4 h-5 w-[3px] -translate-y-1/2 rounded-full bg-lk-blue-soft shadow-[0_0_12px_rgba(224, 75, 95,0.9)]"
                      />
                    ) : null}
                    <item.icon className={cn("size-4", active && "text-lk-blue-soft")} />
                    {item.label}
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
