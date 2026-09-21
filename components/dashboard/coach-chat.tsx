"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Analyse mon blocage du jour",
  "Recadre mes priorités de la semaine",
  "Aide-moi à structurer mon pitch",
  "Challenge mon dernier OKR",
];

function messageText(message: UIMessage) {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function CoachChat({ initialMessages }: { initialMessages: UIMessage[] }) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-border bg-card/40">
      <ScrollArea className="flex-1 px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-gold/10">
              <Sparkles className="size-5 text-brand-gold" />
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pose ta question au Coach Lock In. Direct, exigeant, orienté
              exécution.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-gradient-to-b from-brand-gold-soft to-brand-gold text-black"
                      : "glass text-foreground",
                  )}
                >
                  {messageText(message)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass rounded-xl px-4 py-2.5 text-sm text-muted-foreground">
                  Le coach réfléchit...
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border/60 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => submit(prompt)}
              disabled={isLoading}
              className="rounded-full border border-brand-gold/20 bg-brand-gold/5 px-3 py-1 text-xs text-brand-gold-soft transition-colors hover:bg-brand-gold/10 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Écris ton message au coach..."
            rows={1}
            className="min-h-11 flex-1 resize-none"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
