import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireLockinOnboarded } from "@/lib/auth";
import { getMessages } from "@/lib/actions/messages";
import { MessageThread } from "@/components/social/message-thread";

export const dynamic = "force-dynamic";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireLockinOnboarded();
  const { userId } = await params;
  const otherUserId = Number(userId);
  if (!Number.isInteger(otherUserId)) notFound();

  const data = await getMessages(otherUserId);
  if (!data) notFound();

  return (
    <div className="camp-scope -m-4 flex min-h-[calc(100vh-5rem)] flex-col border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <Link
          href="/dashboard/messages"
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-camp-charcoal/60 uppercase hover:text-camp-charcoal"
        >
          <ArrowLeft className="size-3.5" /> Messages
        </Link>

        <div className="mb-4 flex items-center gap-3 border-b-2 border-camp-charcoal pb-4">
          <Link
            href={`/dashboard/u/${data.otherUser.id}`}
            className="font-display text-lg font-bold text-camp-charcoal uppercase hover:text-camp-gold"
          >
            {data.otherUser.name ?? "Membre Lockin"}
          </Link>
        </div>

        <MessageThread
          recipientId={data.otherUser.id}
          currentUserId={data.currentUserId}
          thread={data.thread}
        />
      </div>
    </div>
  );
}
