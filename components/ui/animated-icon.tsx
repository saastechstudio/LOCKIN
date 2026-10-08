import type { LucideIcon, LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Icône line-art animée : le trait se dessine à l'apparition puis se
 * redessine au survol de la carte parente (`group`). Voir .lk-draw dans
 * styles/animations.css ; sous prefers-reduced-motion l'icône est statique.
 */
export function AnimatedIcon({
  icon: IconComponent,
  className,
  ...props
}: { icon: LucideIcon } & LucideProps) {
  return (
    <IconComponent
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden
      className={cn("lk-draw size-6", className)}
      {...props}
    />
  );
}
