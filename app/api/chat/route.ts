import { streamText, convertToModelMessages, type UIMessage } from "ai";

import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { COACH_SYSTEM_PROMPT } from "@/lib/ai/coach";
import { resolveModel } from "@/lib/ai/model";

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

  const result = streamText({
    model: resolveModel(),
    system: COACH_SYSTEM_PROMPT,
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

  return result.toUIMessageStreamResponse();
}
