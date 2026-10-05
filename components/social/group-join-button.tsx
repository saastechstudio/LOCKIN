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
          ? "border border-camp-charcoal px-5 py-2 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
          : "border border-camp-charcoal bg-camp-gold px-5 py-2 text-xs font-semibold tracking-[0.08em] text-camp-charcoal uppercase disabled:opacity-40"
      }
    >
      {isMember ? "Quitter le club" : "Rejoindre le club"}
    </button>
  );
}
