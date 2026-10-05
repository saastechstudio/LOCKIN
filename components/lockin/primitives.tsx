import { cn } from "@/lib/utils";

/** Le slogan Lockin — une seule source pour la landing, l'app et les écrans de progression. */
export const SLOGAN_LINE_1 = "La vie est un combat.";
export const SLOGAN_LINE_2 = "Le vrai, c'est contre toi.";
export const SLOGAN = `${SLOGAN_LINE_1} ${SLOGAN_LINE_2}`;

/** Petite étiquette en capitales espacées au-dessus d'un titre. */
export function Eyebrow({
  children,
  className,
  gold = false,
}: {
  children: React.ReactNode;
  className?: string;
  gold?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold tracking-[0.25em] uppercase",
        gold ? "text-lk-gold" : "text-lk-black/50",
        className,
      )}
    >
      {children}
    </p>
  );
}

const TITLE_SIZES = {
  hero: "text-5xl leading-[0.95] sm:text-6xl lg:text-7xl",
  xl: "text-4xl leading-[1.02] sm:text-5xl",
  lg: "text-3xl leading-tight sm:text-4xl",
  md: "text-2xl leading-tight",
  sm: "text-lg leading-snug",
} as const;

/** Titre Lockin : Space Grotesk (font-display), gras, serré, noir. */
export function Title({
  as: Tag = "h2",
  size = "lg",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  size?: keyof typeof TITLE_SIZES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("font-display tracking-tight text-lk-black", TITLE_SIZES[size], className)}>
      {children}
    </Tag>
  );
}

/** Le slogan en titre, coupé en deux lignes ; la seconde porte le combat. */
export function Slogan({
  as = "h1",
  size = "hero",
  className,
}: {
  as?: "h1" | "h2" | "p";
  size?: keyof typeof TITLE_SIZES;
  className?: string;
}) {
  return (
    <Title as={as} size={size} className={className}>
      <span className="block">{SLOGAN_LINE_1}</span>
      <span className="block">{SLOGAN_LINE_2}</span>
    </Title>
  );
}

/**
 * Section Lockin : bloc pleine largeur, filet bas, contenu centré.
 * `tone="black"` inverse les couleurs (aplat noir, texte blanc).
 */
export function Section({
  id,
  tone = "white",
  className,
  innerClassName,
  children,
}: {
  id?: string;
  tone?: "white" | "mist" | "black";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-lk-line",
        tone === "mist" && "bg-lk-mist",
        tone === "black" && "border-lk-black bg-lk-black text-lk-white",
        className,
      )}
    >
      <div className={cn("mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** En-tête d'écran de l'application : étiquette, titre, description, actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-lk-black pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Title as="h1" size="lg" className={eyebrow ? "mt-4" : undefined}>
          {title}
        </Title>
        {description ? (
          <p className="mt-4 text-sm leading-relaxed text-lk-black/60 sm:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

/** Chiffre-clé : grande valeur tabulaire + libellé. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-lk-black pt-4", className)}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-lk-black/50 uppercase">{label}</p>
      <p className="font-display mt-3 text-4xl text-lk-black tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs text-lk-black/50">{hint}</p> : null}
    </div>
  );
}
