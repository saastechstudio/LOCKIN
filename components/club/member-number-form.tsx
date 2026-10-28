"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { activateClubMembership } from "@/lib/actions/club-access";
import { PRICE_LABEL } from "@/lib/club/membership";
import { Logo } from "@/components/lockin/logo";
import { LockinButton, LockinInput, LockinLabel } from "@/components/lockin/lockin-ui";
import { FormError, useAction } from "@/components/formations/use-action";

/** Porte du club : le numéro de membre reçu à la confirmation de la place au Lockin Trip. */
export function MemberNumberForm({ lockinTripHref }: { lockinTripHref: string }) {
  const router = useRouter();
  const { run, pending, error } = useAction();
  const [number, setNumber] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() => activateClubMembership(number), () => router.refresh());
  }

  return (
    <div className="camp-scope min-h-screen px-5 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-10">
          <Logo size="sm" href={null} />
        </div>

        <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">Lockin Social Club</p>
        <h1 className="font-display mt-3 text-3xl text-lk-black sm:text-4xl">Entre avec ton numéro de membre</h1>
        <p className="mt-3 text-sm leading-relaxed text-lk-stone-3">
          Le club est réservé aux personnes du Lockin Trip. Il s&apos;ouvre au début de ton séjour : ton numéro de
          membre t&apos;est envoyé par email quand ta place est confirmée. L&apos;adhésion est offerte la première
          année, puis {PRICE_LABEL} par an.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <LockinLabel htmlFor="member-number">Numéro de membre</LockinLabel>
            <LockinInput
              id="member-number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="LT-A7K2MQ"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={16}
              required
            />
          </div>
          <FormError message={error} />
          <LockinButton type="submit" disabled={pending || number.trim().length < 6}>
            {pending ? "Vérification…" : "Entrer dans le club"}
          </LockinButton>
        </form>

        <p className="mt-10 border-t border-lk-line pt-6 text-sm text-lk-stone-3">
          Tu n&apos;as pas encore de numéro ?{" "}
          <a href={lockinTripHref} className="text-lk-black underline underline-offset-4">
            Découvre le Lockin Trip
          </a>
          .
        </p>
      </div>
    </div>
  );
}
