import Link from "next/link";

import { LogoMark } from "@/components/lockin/logo-mark";
import { cn } from "@/lib/utils";

/**
 * Logo Lockin Social Club : le monogramme en arche + « LOCKIN » en capitales
 * très espacées + « SOCIAL CLUB » dessous, en blanc sur le vert. En `lg`, la
 * version empilée du logo officiel (arche au-dessus du nom). `compact`
 * n'affiche que l'arche ; `wordmarkFrom="sm"` ne montre le nom qu'à partir de
 * la tablette (en-têtes mobiles chargés).
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
  const icon = { sm: "h-7", md: "h-8", lg: "h-14" }[size];
  const text = {
    sm: "text-[13px] tracking-[0.34em]",
    md: "text-sm tracking-[0.34em]",
    lg: "text-2xl tracking-[0.34em] sm:text-3xl",
  }[size];
  const sub = {
    sm: "text-[8.5px] tracking-[0.5em]",
    md: "text-[9.5px] tracking-[0.5em]",
    lg: "text-xs tracking-[0.62em] sm:text-sm",
  }[size];
  const stacked = size === "lg";

  const content = (
    <>
      <LogoMark className={icon} />
      {compact ? (
        <span className="sr-only">Lockin Social Club</span>
      ) : (
        <span className={cn("flex flex-col leading-none", stacked && "mt-1", wordmarkFrom === "sm" && "max-sm:sr-only")}>
          <span className={cn("font-medium whitespace-nowrap uppercase", text)}>Lockin</span>
          <span className={cn("whitespace-nowrap uppercase", stacked ? "mt-3" : "mt-1.5", sub)}>Social Club</span>
        </span>
      )}
    </>
  );

  const classes = cn("inline-flex gap-3 text-lk-black", stacked ? "flex-col items-start gap-4" : "items-center", className);
  if (href === null) return <span className={classes}>{content}</span>;
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
