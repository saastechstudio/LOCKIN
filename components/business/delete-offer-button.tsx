"use client";

import { useTransition } from "react";

import { deleteBusinessOffer } from "@/lib/actions/business";

export function DeleteOfferButton({ offerId }: { offerId: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm("Retirer cette annonce ?")) startTransition(() => deleteBusinessOffer(offerId));
      }}
      className="text-xs text-lk-stone-3 underline underline-offset-4 hover:text-lk-black"
    >
      Retirer
    </button>
  );
}
