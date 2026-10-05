import { cn } from "@/lib/utils";

/**
 * Le cadenas Lockin : vertical, rectangulaire, anse carrée, angles vifs.
 * Symbole principal de la marque — logo, icône de niveau, états verrouillés.
 *
 * - `solid` : corps plein (logo, marque).
 * - `level`/`max` : le corps se remplit par paliers depuis le bas, un palier
 *   par niveau atteint. C'est l'icône de niveau des profils : on ne gagne pas
 *   de badge, on verrouille sa discipline, palier après palier.
 */
export function LockIcon({
  className,
  solid = true,
  level,
  max = 5,
  title,
}: {
  className?: string;
  solid?: boolean;
  level?: number;
  max?: number;
  title?: string;
}) {
  const showLevel = typeof level === "number";
  const filled = showLevel ? Math.max(0, Math.min(max, Math.round(level))) : 0;
  // Corps : x 2→22, y 13→31 (18 de haut) ; paliers empilés avec 1 d'écart.
  const bodyTop = 13;
  const bodyHeight = 18;
  const inner = 2;
  const gap = 1;
  const stepHeight = showLevel ? (bodyHeight - inner * 2 - gap * (max - 1)) / max : 0;

  return (
    <svg
      viewBox="0 0 24 32"
      className={cn("h-8 w-6 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      shapeRendering="crispEdges"
    >
      {title ? <title>{title}</title> : null}
      {/* Anse : un U inversé à angles droits. */}
      <path
        d="M6 13V3H18V13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {showLevel ? (
        <>
          <rect
            x="2.75"
            y={bodyTop + 0.75}
            width="18.5"
            height={bodyHeight - 1.5}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {Array.from({ length: max }, (_, i) => {
            const y = bodyTop + bodyHeight - inner - (i + 1) * stepHeight - i * gap;
            return (
              <rect
                key={i}
                x={2 + inner + 0.5}
                y={y}
                width={20 - inner * 2 - 1}
                height={stepHeight}
                fill="currentColor"
                opacity={i < filled ? 1 : 0.12}
              />
            );
          })}
        </>
      ) : solid ? (
        <>
          <rect x="2" y={bodyTop} width="20" height={bodyHeight} fill="currentColor" />
          {/* Serrure : une fente verticale, découpée dans le corps. */}
          <rect x="11" y="19" width="2" height="7" className="fill-lk-white" />
        </>
      ) : (
        <>
          <rect
            x="2.75"
            y={bodyTop + 0.75}
            width="18.5"
            height={bodyHeight - 1.5}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect x="11" y="19" width="2" height="7" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
