import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

import { db } from "@/lib/db";
import { aiConversations } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { COACH_SYSTEM_PROMPT } from "@/lib/ai/coach";

export const maxDuration = 30;

function resolveModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-3-5-sonnet-20241022");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.0-flash");
  }
  throw new Error(
    "No AI provider configured — set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY",
  );
}

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
