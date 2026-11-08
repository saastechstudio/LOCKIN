"use client";

import { useEffect } from "react";

/**
 * Projecteur du verre : suit le curseur et pose --mx / --my (en pixels, dans
 * le repère de la carte) sur la surface .lk-glass survolée ; le CSS en fait
 * un reflet qui glisse sous le doigt. Un seul écouteur pour tout le site,
 * limité à une mise à jour par image, inactif sur écran tactile.
 */
export function GlassPointer() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const event = last;
      if (!event || !(event.target instanceof Element)) return;
      const glass = event.target.closest<HTMLElement>(".lk-glass, .lk-glass-strong");
      if (!glass) return;
      const rect = glass.getBoundingClientRect();
      glass.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      glass.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
