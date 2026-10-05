"use client";

import { useState, useTransition } from "react";

import type { ActionResult } from "@/lib/action-result";

/**
 * Appelle une Server Action du module Formation et expose son état.
 * L'erreur affichée est celle renvoyée par l'action (déjà en français),
 * pas une exception : elle survit à la production.
 */
export function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run<T>(fn: () => Promise<ActionResult<T>>, onDone?: (data: T) => void) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await fn();
        if (result.ok) onDone?.(result.data);
        else setError(result.error);
      } catch {
        // Réseau coupé, serveur indisponible : un message, jamais une page blanche.
        setError("Connexion impossible. Vérifie ton réseau et réessaie.");
      }
    });
  }

  return { run, pending, error, setError };
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-2 border-lk-black pl-3 text-sm text-lk-black">
      {message}
    </p>
  );
}
