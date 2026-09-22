"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#pillars-values", label: "Le Club" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#methode", label: "La Méthode" },
  { href: "#pricing", label: "Tarifs" },
];

export function MobileSiteNav() {
  const [open, setOpen] = useState(false);

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
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
            "bg-brand-card fixed inset-x-0 top-0 z-50 flex flex-col border-b border-border p-6 shadow-2xl duration-200 md:hidden",
          )}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="font-display text-base text-foreground lowercase">
              lock in
            </DialogPrimitive.Title>
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

          <nav className="mt-6 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-6">
            <Button asChild variant="outline" onClick={() => setOpen(false)}>
              <Link href="/sign-in">Connexion</Link>
            </Button>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/sign-up">Rejoindre le Club</Link>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
