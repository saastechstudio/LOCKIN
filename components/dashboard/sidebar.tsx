"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BrainCircuit, Users, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/coach", label: "Coach IA", icon: BrainCircuit },
  { href: "/dashboard/network", label: "Réseau", icon: Users },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card/40 md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-6">
        <Image src="/logo-mark.svg" alt="Lock In" width={24} height={24} />
        <span className="font-display text-base tracking-[0.18em] text-foreground">
          LOCK IN
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brand-prune/10 text-brand-prune-soft border border-brand-prune/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-4 text-center text-[11px] tracking-wide text-muted-foreground/60">
        L&apos;excellence n&apos;est pas une destination.
      </div>
    </aside>
  );
}
