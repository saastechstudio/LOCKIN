import { cn } from "@/lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

/** Titre de section minimaliste pour les écrans Lock-In Camp — peu de texte, hiérarchie claire. */
export function SectionTitle({ eyebrow, title, description, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-camp-sand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl text-camp-brown-deep">{title}</h2>
      {description ? (
        <p className="text-sm text-camp-brown-soft">{description}</p>
      ) : null}
    </div>
  );
}
