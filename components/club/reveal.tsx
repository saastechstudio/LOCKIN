"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Décalage en secondes, pour les cascades. */
  delay?: number;
  /** Léger flou en entrée : réservé aux gros titres. */
  blur?: boolean;
  /** Joue dès le montage (hero) plutôt qu'à l'entrée dans l'écran. */
  immediate?: boolean;
  as?: "div" | "span" | "p" | "h1" | "h2" | "li";
};

/** Monte de 24 px avec un fondu. Statique si l'utilisateur réduit les animations. */
export function Reveal({ children, className, delay = 0, blur = false, immediate = false, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const hidden = { opacity: 0, y: 24, filter: blur ? "blur(8px)" : "blur(0px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <Tag
      className={className}
      initial={hidden}
      {...(immediate ? { animate: shown } : { whileInView: shown, viewport: { once: true, margin: "-10% 0px" } })}
      transition={{ duration: blur ? 1.4 : 1.1, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
