"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Défilement fluide (Lenis, ~1,15 s). Désactivé si l'utilisateur réduit les animations. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: true,
      autoRaf: true,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
