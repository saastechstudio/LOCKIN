import { cn } from "@/lib/utils";

/** Anneau de progression lumineux (SVG), utilisé pour le score, les objectifs et le focus. */
export function Ring({
  value,
  size = 64,
  stroke = 5,
  color = "var(--lk-blue-soft)",
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible" style={{ filter: `drop-shadow(0 0 6px ${color})` }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(250,249,247,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** En-tête de panneau du cockpit : étiquette, titre, action optionnelle. */
export function PanelHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-lk-stone-2 uppercase">{eyebrow}</p>
        <h2 className="font-display mt-1.5 text-lg text-lk-black">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("lk-glass lk-edge rounded-3xl p-5 sm:p-6", className)}>{children}</section>;
}
