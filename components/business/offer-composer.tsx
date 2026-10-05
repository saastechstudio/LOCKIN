"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { createBusinessOffer } from "@/lib/actions/business";
import { BUSINESS_KINDS, BUSINESS_KIND_LABELS, type BusinessKind } from "@/lib/business-data";
import { Button } from "@/components/ui/button";

const field =
  "w-full border border-lk-line px-4 py-3 text-sm outline-none placeholder:text-lk-black/40 focus:border-lk-black";

/** Publier une annonce business — modérée à la publication comme tout le club. */
export function OfferComposer() {
  const [kind, setKind] = useState<BusinessKind>("offre");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createBusinessOffer({ kind, title, body, location });
        setTitle("");
        setBody("");
        setLocation("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Publication impossible.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-lk-black p-6">
      <p className="font-display text-lg">Publier une annonce</p>
      <div className="grid grid-cols-3 border-t border-l border-lk-line">
        {BUSINESS_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={cn(
              "border-r border-b border-lk-line py-2 text-xs font-medium",
              kind === k ? "bg-lk-black text-lk-white" : "hover:bg-lk-mist",
            )}
          >
            {BUSINESS_KIND_LABELS[k]}
          </button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required minLength={3} placeholder="Titre" className={field} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required minLength={10} rows={4} placeholder="Ce que tu proposes ou cherches, concrètement." className={cn(field, "resize-none")} />
      <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="Ville ou « à distance » (facultatif)" className={field} />
      {error ? <p className="border-l-2 border-lk-black pl-3 text-sm">{error}</p> : null}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Publication…" : "Publier"}
      </Button>
      <p className="text-xs text-lk-black/50">
        Pas de vente forcée, pas de promesse de gains. Les annonces sont modérées selon la charte Lockin.
      </p>
    </form>
  );
}
