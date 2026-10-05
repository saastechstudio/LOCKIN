import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { getTodayFocus } from "@/lib/actions/daily-focus";
import { buildCoachSystemPrompt } from "@/lib/ai/coach";
import { getModelCandidates, markProviderBroken } from "@/lib/ai/model";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const maxDuration = 30;

const FALLBACK_TEXT =
  "Le Coach IA a rencontré un problème. Réessaie dans un instant.";

/** Garde-fous : l'historique vient du navigateur, donc rien n'y est cru sur parole. */
const MAX_MESSAGES = 30;
const MAX_TEXT_PER_MESSAGE = 4_000;
const MAX_BODY_BYTES = 200_000;

/**
 * Ne garde que des messages user/assistant faits de texte, bornés en
 * nombre et en taille : un client ne peut ni injecter de message
 * « system », ni faire payer des requêtes IA géantes.
 */
function sanitizeMessages(raw: unknown): UIMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const clean: UIMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const { id, role, parts } = m as { id?: unknown; role?: unknown; parts?: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (!Array.isArray(parts)) return null;
    const text = parts
      .filter((p): p is { type: "text"; text: string } =>
        Boolean(p) && (p as { type?: unknown }).type === "text" && typeof (p as { text?: unknown }).text === "string",
      )
      .map((p) => p.text)
      .join("\n")
      .slice(0, MAX_TEXT_PER_MESSAGE);
    if (!text.trim()) continue;
    clean.push({
      id: typeof id === "string" ? id.slice(0, 100) : crypto.randomUUID(),
      role,
      parts: [{ type: "text", text }],
    });
  }
  return clean.length > 0 && clean[clean.length - 1].role === "user" ? clean : null;
}

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();

  const retryAfter = consumeRateLimit(`aiChat:${user.id}`, RATE_LIMITS.aiChat);
  if (retryAfter > 0) {
    return new Response("Trop de messages en peu de temps. Réessaie dans quelques minutes.", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return new Response("Conversation trop longue.", { status: 413 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Requête invalide.", { status: 400 });
  }
  const messages = sanitizeMessages((payload as { messages?: unknown })?.messages);
  if (!messages) {
    return new Response("Requête invalide.", { status: 400 });
  }

  const lastUserMessage = messages[messages.length - 1];
  const lastUserText =
    lastUserMessage?.role === "user"
      ? lastUserMessage.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("\n")
      : "";

  if (lastUserText) {
    await db.insert(aiConversations).values({
      userId: user.id,
      role: "user",
      content: lastUserText,
    });
  }

  const todayFocus = await getTodayFocus();
  const system = buildCoachSystemPrompt(user, todayFocus.mood);
  const modelMessages = await convertToModelMessages(messages);

  const candidates = getModelCandidates();
  if (candidates.length === 0) {
    return new Response(
      "Aucun fournisseur IA disponible pour le moment. Réessaie dans un instant.",
      { status: 502 },
    );
  }

  // Un fournisseur peut être en panne (crédit épuisé, quota, limite de
  // débit) sans que les autres le soient. On essaie chaque fournisseur
  // configuré dans l'ordre — comme pour l'audit — plutôt que de dépendre
  // du seul premier candidat et de faire échouer tout le message.
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let text: string | undefined;

      for (const candidate of candidates) {
        try {
          const result = streamText({
            model: candidate.model,
            system,
            messages: modelMessages,
            maxRetries: 1,
          });
          text = await result.text;
          break;
        } catch (error) {
          console.error(`[chat] AI generation failed on ${candidate.id}`, error);
          markProviderBroken(candidate.id, error);
        }
      }

      const finalText = text ?? FALLBACK_TEXT;

      writer.write({ type: "text-start", id: "0" });
      writer.write({ type: "text-delta", id: "0", delta: finalText });
      writer.write({ type: "text-end", id: "0" });

      if (text) {
        await db.insert(aiConversations).values({
          userId: user.id,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
