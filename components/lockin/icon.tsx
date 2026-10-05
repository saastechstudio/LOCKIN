import type { LucideIcon, LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Icône Lockin : une icône lucide dans le style maison — trait fin 1.5,
 * extrémités carrées, angles vifs (voir svg.lucide dans globals.css).
 * `framed` l'enferme dans un carré à filet : la case géométrique Lockin.
 */
export function Icon({
  icon: IconComponent,
  framed = false,
  className,
  ...props
}: { icon: LucideIcon; framed?: boolean } & LucideProps) {
  const glyph = (
    <IconComponent
      strokeWidth={1.5}
      absoluteStrokeWidth
      className={cn("size-4", !framed && className)}
      aria-hidden
      {...props}
    />
  );
  if (!framed) return glyph;
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center border border-lk-black text-lk-black",
        className,
      )}
    >
      {glyph}
    </span>
  );
}
