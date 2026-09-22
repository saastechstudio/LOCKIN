"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Sparkles } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Analyse mon blocage du jour",
  "Recadre mes priorités de la semaine",
  "Aide-moi à structurer ma présentation",
  "Bouscule-moi sur mon dernier objectif",
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
    <div className="bg-brand-card shadow-soft flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border border-border">
      <ScrollArea className="flex-1 px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/15 via-brand-coral/15 to-brand-yellow/15">
              <Sparkles className="text-brand-blue size-5" />
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
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-brand-blue shadow-blue-glow text-white"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {messageText(message)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
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
              className="rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1 text-xs text-brand-blue-deep transition-colors hover:bg-brand-blue/10 disabled:opacity-50"
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
          className="shadow-soft flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-brand-blue/[0.06] via-brand-coral/[0.06] to-brand-yellow/[0.06] p-1.5 pl-5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Demande n'importe quoi au coach..."
            className="h-9 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Envoyer"
            className="bg-brand-blue shadow-blue-glow flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
