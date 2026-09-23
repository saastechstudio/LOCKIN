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

export const maxDuration = 30;

const FALLBACK_TEXT =
  "Le Coach IA a rencontré un problème. Réessaie dans un instant.";

export async function POST(req: Request) {
  const user = await getOrCreateDbUser();
  const { messages }: { messages: UIMessage[] } = await req.json();

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
