"use client";

import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Wraps a technical term with a small info button. Tapping or clicking it
 * shows a plain-language definition in a popover, works the same on mobile
 * (tap) and desktop (click), no hover required.
 */
export function GlossaryTerm({
  definition,
  children,
}: {
  definition: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Voir la définition simple"
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-brand-blue"
          >
            <Info className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent>{definition}</PopoverContent>
      </Popover>
    </span>
  );
}
