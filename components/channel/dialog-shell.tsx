"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/** Boîte de dialogue en verre commune aux outils de la conversation. */
export function DialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="lk-glass-strong data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl p-6 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogPrimitive.Title className="font-display text-xl text-lk-black">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-lk-stone-3">{description}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-lk-stone-3 hover:bg-lk-surface hover:text-lk-black">
              <X className="size-4" />
              <span className="sr-only">Fermer</span>
            </DialogPrimitive.Close>
          </div>
          <div className="mt-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
