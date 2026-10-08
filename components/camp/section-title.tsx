import { cn } from "@/lib/utils";

type SectionTitleProps = {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

/**
 * Titre de section brutaliste : repère numéroté ("01 — INCLUS") en lettres
 * espacées plutôt qu'une icône, titre massif en capitales. Pas de centrage
 * "carte SaaS" — tout est aligné à gauche, la hiérarchie vient de la taille
 * et du poids, pas d'un fond ou d'une ombre. Toujours sur fond blanc : une
 * seule palette de texte, pas de variante "dark".
 */
export function SectionTitle({ index, eyebrow, title, description, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-semibold tracking-[0.25em] text-camp-gold uppercase">
        {index ? `${index} — ` : ""}
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl leading-[1.05] text-camp-charcoal sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-lk-stone-3">{description}</p>
      ) : null}
    </div>
  );
}
