import Link from "next/link";

import { LogoMark } from "@/components/lockin/logo-mark";
import { cn } from "@/lib/utils";

/**
 * Logo Lockin : le « L » officiel + le nom en capitales espacées.
 * `compact` n'affiche que le « L » ; `wordmarkFrom="sm"` ne montre le nom
 * qu'à partir de la tablette (en-têtes mobiles chargés).
 */
export function Logo({
  href = "/",
  compact = false,
  wordmarkFrom,
  size = "md",
  className,
}: {
  href?: string | null;
  compact?: boolean;
  wordmarkFrom?: "sm";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const icon = { sm: "h-7", md: "h-8", lg: "h-12" }[size];
  const text = {
    sm: "text-[11px] tracking-[0.18em]",
    md: "text-xs tracking-[0.16em] sm:text-sm sm:tracking-[0.2em]",
    lg: "text-xl tracking-[0.14em] sm:text-2xl",
  }[size];

  const content = (
    <>
      <LogoMark className={icon} />
      {compact ? (
        <span className="sr-only">Lockin Social Club</span>
      ) : (
        <span
          className={cn(
            "font-bold whitespace-nowrap uppercase",
            wordmarkFrom === "sm" && "max-sm:sr-only",
            text,
          )}
        >
          Lockin Social Club
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex items-center gap-3 text-lk-black", className);
  if (href === null) return <span className={classes}>{content}</span>;
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
