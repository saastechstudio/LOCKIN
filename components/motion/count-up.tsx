"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Nombre qui monte de 0 à sa valeur quand il entre à l'écran. Écrit le texte
 * directement dans le DOM pendant l'animation (aucun re-rendu par image).
 * Rendu serveur et réduction des animations : la valeur finale, tout de suite.
 */
export function CountUp({
  value,
  duration = 1.3,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const format = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useLayoutEffect(() => {
    if (!reduce && ref.current && !inView) ref.current.textContent = format(0);
    // format dépend uniquement de decimals et suffix, déjà couverts ci-dessous.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, inView, decimals, suffix]);

  useLayoutEffect(() => {
    if (reduce || !inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
      onComplete: () => {
        node.textContent = format(value);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, duration, decimals, suffix]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {format(value)}
    </span>
  );
}
