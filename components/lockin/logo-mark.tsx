import { cn } from "@/lib/utils";

/**
 * Le monogramme Lockin : une arche (le cadre, l'horizon) qui se referme sur
 * un point (l'objectif), posée sur sa ligne d'horizon. Trait fin, couleur
 * héritée (currentColor). La hauteur se règle avec une classe `h-*`.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("aspect-square h-8 w-auto shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d="M6 26V14a10 10 0 0 1 20 0v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M11 26V15a5 5 0 0 1 10 0v11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".55"
      />
      <circle cx="16" cy="21.5" r="1.6" fill="currentColor" />
      <path d="M3 26h26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
