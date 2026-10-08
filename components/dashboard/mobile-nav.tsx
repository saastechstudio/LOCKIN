"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/lockin/logo";
import { NavList } from "@/components/dashboard/nav-list";

/** Menu complet sur mobile : un panneau latéral blanc, à filet, sans ombre. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="flex size-9 items-center justify-center border border-lk-line text-lk-black md:hidden"
        >
          <Menu className="size-4" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-lk-black/40 md:hidden" />
        <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-lk-line bg-lk-white duration-200 md:hidden">
          <DialogPrimitive.Title className="sr-only">Menu de navigation</DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between border-b border-lk-line px-6">
            <Logo size="sm" href="/dashboard" />
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="flex size-9 items-center justify-center text-lk-black hover:bg-lk-mist"
              >
                <X className="size-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <NavList onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
