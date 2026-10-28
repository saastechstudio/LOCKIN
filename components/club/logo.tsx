import { cn } from "@/lib/utils";

/** Monogramme : une arche (le cadre, l'horizon) qui se referme sur un point (l'objectif). */
export function ClubMonogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
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

/** Monogramme + « LOCKIN / SOCIAL CLUB ». La couleur suit currentColor. */
export function ClubLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <ClubMonogram className="size-8 shrink-0" />
      {compact ? (
        <span className="sr-only">Lockin Social Club</span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-[13px] font-medium tracking-[0.34em]">LOCKIN</span>
          <span className="mt-1.5 text-[8.5px] tracking-[0.5em] opacity-70">SOCIAL CLUB</span>
        </span>
      )}
    </span>
  );
}
