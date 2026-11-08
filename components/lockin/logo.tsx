import Link from "next/link";

import { LogoMark } from "@/components/lockin/logo-mark";
import { cn } from "@/lib/utils";

/**
 * Logo Lockin : le monogramme en arche + « LOCKIN » en capitales très
 * espacées. `compact` n'affiche que l'arche ; `wordmarkFrom="sm"` ne montre
 * le nom qu'à partir de la tablette (en-têtes mobiles chargés).
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
    sm: "text-[13px] tracking-[0.34em]",
    md: "text-sm tracking-[0.34em]",
    lg: "text-xl tracking-[0.3em] sm:text-2xl",
  }[size];

  const content = (
    <>
      <LogoMark className={icon} />
      {compact ? (
        <span className="sr-only">Lockin</span>
      ) : (
        <span
          className={cn(
            "font-medium whitespace-nowrap uppercase",
            wordmarkFrom === "sm" && "max-sm:sr-only",
            text,
          )}
        >
          Lockin
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
