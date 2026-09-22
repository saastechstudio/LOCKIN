import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";

/** Anthropic → OpenAI → Gemini → Mistral, first configured key wins. */
export function resolveModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-3-5-sonnet-20241022");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.0-flash");
  }
  if (process.env.MISTRAL_API_KEY) {
    return mistral("mistral-large-latest");
  }
  throw new Error(
    "No AI provider configured — set ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or MISTRAL_API_KEY",
  );
}
