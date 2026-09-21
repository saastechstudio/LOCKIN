"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="flex size-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
        >
          <Menu className="size-4" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 md:hidden" />
        <DialogPrimitive.Content
          className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "bg-brand-card fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border p-0 shadow-2xl duration-200 md:hidden",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Menu de navigation
          </DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-mark.png"
                alt="Lock In"
                width={28}
                height={33}
                className="h-7 w-auto"
              />
              <span className="font-display text-base tracking-tight text-foreground lowercase">
                lock in
              </span>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            {DASHBOARD_NAV.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-brand-blue/10 text-brand-blue-deep border border-brand-blue/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
