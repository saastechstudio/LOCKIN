import { cn } from "@/lib/utils";

/**
 * Apparition au scroll : fade-in + glissement de 10 px (styles/animations.css).
 * Composant serveur, sans JS : piloté par animation-timeline: view(), il reste
 * simplement visible là où le navigateur ne le gère pas.
 * `delay` (ms) échelonne les éléments d'une grille en jouant sur la plage
 * d'animation — utile pour les cartes d'une même rangée.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "section" | "li" | "article" | "p";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      data-reveal
      style={delay ? { animationRange: `entry ${delay / 20}% entry ${35 + delay / 20}%` } : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
