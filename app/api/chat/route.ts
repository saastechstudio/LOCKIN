import { streamText, convertToModelMessages, type UIMessage } from "ai";

import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { getTodayFocus } from "@/lib/actions/daily-focus";
import { buildCoachSystemPrompt } from "@/lib/ai/coach";
import { getModelCandidates, markProviderBroken } from "@/lib/ai/model";

export const maxDuration = 30;

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

  const [candidate] = getModelCandidates();
  if (!candidate) {
    return new Response(
      "Aucun fournisseur IA disponible pour le moment. Réessaie dans un instant.",
      { status: 502 },
    );
  }

  const result = streamText({
    model: candidate.model,
    system: buildCoachSystemPrompt(user, todayFocus.mood),
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (text) {
        await db.insert(aiConversations).values({
          userId: user.id,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toUIMessageStreamResponse({
    // Le fournisseur choisi peut tomber en panne pendant le streaming
    // (crédit épuisé, quota) : on le met en pause pour que les prochains
    // messages, audit compris, basculent directement sur le suivant.
    onError: (error) => {
      console.error(`[chat] AI generation failed on ${candidate.id}`, error);
      markProviderBroken(candidate.id);
      return "Le Coach IA a rencontré un problème. Réessaie dans un instant.";
    },
  });
}
