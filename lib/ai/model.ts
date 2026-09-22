import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { APICallError, RetryError, type LanguageModel } from "ai";

export type ProviderId = "edenai" | "mistral" | "anthropic" | "openai" | "google";

const edenai = createOpenAICompatible({
  name: "edenai",
  baseURL: "https://api.edenai.run/v3",
  apiKey: process.env.EDEN_AI_API_KEY,
});

const PROVIDERS: {
  id: ProviderId;
  envVar: string;
  build: () => LanguageModel;
}[] = [
  {
    id: "edenai",
    envVar: "EDEN_AI_API_KEY",
    // Eden AI est une passerelle qui proxifie vers d'autres fournisseurs
    // (OpenAI, Anthropic, Google, Mistral...) derrière une API compatible
    // OpenAI unique — le modèle se choisit avec le préfixe "<fournisseur>/".
    build: () => edenai.chatModel("openai/gpt-4o-mini"),
  },
  {
    id: "mistral",
    envVar: "MISTRAL_API_KEY",
    // mistral-large-latest renvoie "model not available in your
    // subscription tier" sur un compte gratuit/standard — mistral-small
    // est disponible sur tous les paliers.
    build: () => mistral("mistral-small-latest"),
  },
  {
    id: "anthropic",
    envVar: "ANTHROPIC_API_KEY",
    build: () => anthropic("claude-3-5-sonnet-20241022"),
  },
  { id: "openai", envVar: "OPENAI_API_KEY", build: () => openai("gpt-4o") },
  {
    id: "google",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
    // gemini-2.0-flash est déprécié côté Google (erreur explicite pointant
    // vers gemini-3.6-flash).
    build: () => google("gemini-3.6-flash"),
  },
];

// Un fournisseur qui vient d'échouer est mis de côté pendant un délai qui
// dépend du type d'échec : une panne de facturation (crédit épuisé, clé
// invalide, palier d'abonnement) ne se résout pas toute seule, donc on
// laisse le fournisseur de côté longtemps. Une limite de débit ou une
// surcharge temporaire du fournisseur se résorbe en général en quelques
// secondes, donc un cooldown de 10 minutes dans ce cas bloquerait
// inutilement toutes les requêtes suivantes (y compris vers les AUTRES
// fournisseurs, si l'échec initial touche plusieurs d'entre eux à la fois).
const BILLING_COOLDOWN_MS = 10 * 60 * 1000;
const TRANSIENT_COOLDOWN_MS = 20 * 1000;
const DEFAULT_COOLDOWN_MS = 2 * 60 * 1000;

const BILLING_PATTERNS = [
  /credit balance/i,
  /no credits remaining/i,
  /insufficient_quota/i,
  /exceeded your current quota/i,
  /not available in your subscription tier/i,
  /billing/i,
];
const TRANSIENT_PATTERNS = [
  /rate limit/i,
  /too many requests/i,
  /overloaded/i,
  /high demand/i,
  /capacity/i,
];

function unwrapError(error: unknown): unknown {
  return RetryError.isInstance(error) ? error.lastError : error;
}

/**
 * Détermine combien de temps mettre un fournisseur de côté après un échec,
 * selon qu'il s'agit d'un problème de facturation (long), d'une limite de
 * débit / surcharge transitoire (court), ou d'autre chose (moyen).
 */
export function getCooldownMs(error: unknown): number {
  const cause = unwrapError(error);
  const message = cause instanceof Error ? cause.message : String(cause);

  if (BILLING_PATTERNS.some((p) => p.test(message))) return BILLING_COOLDOWN_MS;
  if (TRANSIENT_PATTERNS.some((p) => p.test(message))) return TRANSIENT_COOLDOWN_MS;

  if (APICallError.isInstance(cause)) {
    if (cause.statusCode === 429) return TRANSIENT_COOLDOWN_MS;
    if (cause.statusCode && cause.statusCode >= 500) return TRANSIENT_COOLDOWN_MS;
  }

  return DEFAULT_COOLDOWN_MS;
}

const brokenUntil = new Map<ProviderId, number>();

export type ModelCandidate = { id: ProviderId; model: LanguageModel };

/**
 * Fournisseurs IA configurés (clé présente) et non en cooldown, dans l'ordre
 * de préférence Eden AI → Mistral → Anthropic → OpenAI → Gemini. Un
 * appelant qui a besoin de résilience doit essayer chaque candidat dans
 * l'ordre et appeler markProviderBroken() sur celui qui échoue avant de
 * passer au suivant.
 */
export function getModelCandidates(): ModelCandidate[] {
  const now = Date.now();
  return PROVIDERS.filter((p) => process.env[p.envVar])
    .filter((p) => (brokenUntil.get(p.id) ?? 0) < now)
    .map((p) => ({ id: p.id, model: p.build() }));
}

export function markProviderBroken(id: ProviderId, error?: unknown) {
  const cooldownMs = error === undefined ? BILLING_COOLDOWN_MS : getCooldownMs(error);
  brokenUntil.set(id, Date.now() + cooldownMs);
}

/**
 * Premier fournisseur disponible, pour les appelants qui ne gèrent pas
 * eux-mêmes le repli sur plusieurs fournisseurs (ex : le chat qui streame).
 */
export function resolveModel(): LanguageModel {
  const [first] = getModelCandidates();
  if (!first) {
    throw new Error(
      "Aucun fournisseur IA disponible pour le moment — vérifie EDEN_AI_API_KEY, MISTRAL_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY ou GOOGLE_GENERATIVE_AI_API_KEY (crédit, quota, clé valide).",
    );
  }
  return first.model;
}
