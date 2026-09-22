import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import type { LanguageModel } from "ai";

export type ProviderId = "anthropic" | "openai" | "google" | "mistral";

const PROVIDERS: {
  id: ProviderId;
  envVar: string;
  build: () => LanguageModel;
}[] = [
  {
    id: "anthropic",
    envVar: "ANTHROPIC_API_KEY",
    build: () => anthropic("claude-3-5-sonnet-20241022"),
  },
  { id: "openai", envVar: "OPENAI_API_KEY", build: () => openai("gpt-4o") },
  {
    id: "google",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
    build: () => google("gemini-2.0-flash"),
  },
  {
    id: "mistral",
    envVar: "MISTRAL_API_KEY",
    build: () => mistral("mistral-large-latest"),
  },
];

// Un fournisseur qui vient d'échouer (clé invalide, plus de crédit, quota
// dépassé) est mis de côté pendant ce délai : les appels suivants passent
// directement au prochain fournisseur configuré plutôt que de réessayer un
// fournisseur qu'on sait cassé à chaque requête.
const COOLDOWN_MS = 10 * 60 * 1000;
const brokenUntil = new Map<ProviderId, number>();

export type ModelCandidate = { id: ProviderId; model: LanguageModel };

/**
 * Fournisseurs IA configurés (clé présente) et non en cooldown, dans l'ordre
 * de préférence Anthropic → OpenAI → Gemini → Mistral. Un appelant qui a
 * besoin de résilience doit essayer chaque candidat dans l'ordre et appeler
 * markProviderBroken() sur celui qui échoue avant de passer au suivant.
 */
export function getModelCandidates(): ModelCandidate[] {
  const now = Date.now();
  return PROVIDERS.filter((p) => process.env[p.envVar])
    .filter((p) => (brokenUntil.get(p.id) ?? 0) < now)
    .map((p) => ({ id: p.id, model: p.build() }));
}

export function markProviderBroken(id: ProviderId) {
  brokenUntil.set(id, Date.now() + COOLDOWN_MS);
}

/**
 * Premier fournisseur disponible, pour les appelants qui ne gèrent pas
 * eux-mêmes le repli sur plusieurs fournisseurs (ex : le chat qui streame).
 */
export function resolveModel(): LanguageModel {
  const [first] = getModelCandidates();
  if (!first) {
    throw new Error(
      "Aucun fournisseur IA disponible pour le moment — vérifie ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY ou MISTRAL_API_KEY (crédit, quota, clé valide).",
    );
  }
  return first.model;
}
