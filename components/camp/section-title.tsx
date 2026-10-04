import { cn } from "@/lib/utils";

type SectionTitleProps = {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Titre de section brutaliste : repère numéroté ("01 — INCLUS") en lettres
 * espacées plutôt qu'une icône, titre massif en capitales. Pas de centrage
 * "carte SaaS" — tout est aligné à gauche, la hiérarchie vient de la taille
 * et du poids, pas d'un fond ou d'une ombre.
 */
export function SectionTitle({
  index,
  eyebrow,
  title,
  description,
  tone = "light",
  className,
}: SectionTitleProps) {
  const dim = tone === "dark" ? "text-camp-cream" : "text-camp-brown";
  const accent = tone === "dark" ? "text-camp-gold" : "text-camp-gold-ink";
  const muted = tone === "dark" ? "text-camp-cream/60" : "text-camp-brown/60";

  return (
    <div className={cn("space-y-3", className)}>
      <p className={cn("font-mono text-xs font-semibold uppercase tracking-[0.25em]", accent)}>
        {index ? `${index} — ` : ""}
        {eyebrow}
      </p>
      <h2 className={cn("font-display text-3xl leading-[1.05] font-bold uppercase sm:text-4xl", dim)}>
        {title}
      </h2>
      {description ? (
        <p className={cn("max-w-md text-sm leading-relaxed", muted)}>{description}</p>
      ) : null}
    </div>
  );
}
