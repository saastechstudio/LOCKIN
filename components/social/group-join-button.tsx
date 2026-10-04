"use client";

import { useTransition } from "react";

import { joinGroup, leaveGroup } from "@/lib/actions/groups";

export function GroupJoinButton({ groupId, isMember }: { groupId: number; isMember: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => (isMember ? leaveGroup(groupId) : joinGroup(groupId)));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        isMember
          ? "border-2 border-camp-charcoal px-5 py-2 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
          : "border-2 border-camp-charcoal bg-camp-gold px-5 py-2 font-mono text-xs font-bold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
      }
    >
      {isMember ? "Quitter le groupe" : "Rejoindre le groupe"}
    </button>
  );
}
