"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_GROUPS, isNavActive } from "@/lib/dashboard-nav";

/** Liste de navigation groupée, partagée par la barre latérale et le menu mobile. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
      {DASHBOARD_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.25em] text-lk-black/40 uppercase">
            {group.label}
          </p>
          <ul className="space-y-px">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-lk-black font-medium text-lk-white"
                        : "text-lk-black/70 hover:bg-lk-mist hover:text-lk-black",
                    )}
                  >
                    <item.icon className="size-4" />
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
