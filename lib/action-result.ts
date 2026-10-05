import { z } from "zod";

/**
 * Résultat des Server Actions du module Formation.
 *
 * Next.js masque en production le message d'une erreur LEVÉE par une
 * Server Action ; la doc demande de renvoyer les erreurs attendues comme
 * des valeurs. Ici : { ok: true, data } ou { ok: false, error }, où
 * `error` est un message en français destiné à l'utilisateur.
 */
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** Erreur dont le message peut être montré tel quel : refus métier, validation, modération, débit. */
export class UserFacingError extends Error {}

const GENERIC = "Une erreur est survenue. Réessaie dans un instant.";

/** redirect() et notFound() de Next lèvent une exception de contrôle : il faut la laisser passer. */
function isNextControlFlow(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_");
}

export async function toResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (isNextControlFlow(error)) throw error;
    if (error instanceof z.ZodError) {
      return { ok: false, error: error.issues[0]?.message ?? "Données invalides." };
    }
    if (error instanceof UserFacingError) return { ok: false, error: error.message };
    // Erreur inattendue (base de données, bug) : on la journalise, on ne la montre pas.
    console.error("[server action]", error);
    return { ok: false, error: GENERIC };
  }
}

/** Enveloppe une Server Action : ses erreurs métier deviennent des valeurs. */
export function action<A extends unknown[], T>(fn: (...args: A) => Promise<T>) {
  return async (...args: A): Promise<ActionResult<T>> => toResult(() => fn(...args));
}
