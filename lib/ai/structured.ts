import "server-only";

import { generateObject } from "ai";
import type { z } from "zod";

import { getModelCandidates, markProviderBroken, type ProviderId } from "@/lib/ai/model";

/**
 * Sortie structurée avec repli : chaque fournisseur configuré est essayé dans
 * l'ordre, celui qui échoue est mis de côté. null quand aucun n'a répondu :
 * l'appelant affiche alors sa version calculée sans IA.
 */
export async function generateStructured<T>(options: {
  schema: z.ZodType<T>;
  system: string;
  prompt: string;
  label: string;
}): Promise<{ object: T; provider: ProviderId } | null> {
  for (const candidate of getModelCandidates()) {
    try {
      const { object } = await generateObject({
        model: candidate.model,
        schema: options.schema,
        system: options.system,
        prompt: options.prompt,
        maxRetries: 1,
      });
      return { object: object as T, provider: candidate.id };
    } catch (error) {
      console.error(`[${options.label}] AI generation failed on ${candidate.id}`, error);
      markProviderBroken(candidate.id, error);
    }
  }
  return null;
}
