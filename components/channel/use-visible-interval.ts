"use client";

import { useEffect, useRef } from "react";

/**
 * Appelle `callback` toutes les `delay` ms tant que l'onglet est visible, et
 * une fois au retour sur l'onglet. C'est le « temps réel » de la messagerie :
 * quelques secondes de latence, aucune connexion qui maintient le serveur éveillé.
 */
export function useVisibleInterval(callback: () => void | Promise<void>, delay: number) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    let timer: number | undefined;
    const tick = () => {
      if (document.visibilityState === "visible") void saved.current();
    };
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(tick, delay);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        start();
      } else {
        window.clearInterval(timer);
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [delay]);
}
