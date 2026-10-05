"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowRight } from "lucide-react";

import { LockIcon } from "@/components/lockin/lock-icon";

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
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden border border-lk-black bg-lk-white md:h-[calc(100vh-10rem)]">
      <ScrollArea className="flex-1 px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <LockIcon className="h-10 w-[30px]" />
            <p className="max-w-sm text-sm text-lk-black/60">
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
                    "max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-lk-black text-lk-white"
                      : "border border-lk-line bg-lk-white text-lk-black",
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
              className="border border-lk-line px-3 py-1.5 text-xs text-lk-black transition-colors hover:border-lk-black disabled:opacity-50"
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
          className="flex items-center gap-2 border border-lk-black bg-lk-white p-1.5 pl-5"
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
            className="flex size-9 shrink-0 items-center justify-center bg-lk-black text-lk-white transition-opacity hover:opacity-85 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
