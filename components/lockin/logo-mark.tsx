import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Le « L » officiel Lockin : PNG à fond transparent (public/logo.png, 418×432).
 * La hauteur se règle avec une classe `h-*` ; la largeur suit le ratio.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <Image
      src="/logo.png"
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      width={418}
      height={432}
      priority
      className={cn("h-8 w-auto shrink-0", className)}
    />
  );
}
