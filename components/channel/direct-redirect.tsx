"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { startDirect } from "@/lib/actions/channel";

/** Ancien lien /messages/{membre} : ouvre (ou crée) l'échange privé puis redirige. */
export function DirectRedirect({ userId }: { userId: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startDirect(userId).then((result) => {
      if (result.ok) router.replace(`/dashboard/messages/c/${result.data.conversationId}`);
      else setError(result.error);
    });
  }, [userId, router]);

  return (
    <div className="flex h-full items-center justify-center p-8 text-sm text-lk-stone-3">
      {error ? <p role="alert" className="text-lk-coral">{error}</p> : <div className="lk-skeleton h-10 w-48 rounded-xl" />}
    </div>
  );
}
