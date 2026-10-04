import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { getConversations } from "@/lib/actions/messages";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MessagesInboxPage() {
  const conversations = await getConversations();

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] border border-camp-hairline p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-xs font-bold tracking-[0.25em] text-camp-gold uppercase">
          Lockin Social Club
        </p>
        <h1 className="font-display mb-6 text-2xl font-bold text-camp-charcoal uppercase">
          Messages
        </h1>

        {conversations.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-camp-charcoal/50 uppercase">
            Aucune conversation — démarre-en une depuis le profil d&apos;un membre.
          </p>
        ) : (
          <div className="divide-y divide-camp-hairline">
            {conversations.map(({ counterpart, lastMessage, unreadCount }) => (
              <Link
                key={counterpart.id}
                href={`/dashboard/messages/${counterpart.id}`}
                className="flex items-center justify-between gap-3 py-4 hover:bg-camp-cream"
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm",
                      unreadCount > 0 ? "font-bold text-camp-charcoal" : "font-medium text-camp-charcoal",
                    )}
                  >
                    {counterpart.name ?? "Membre Lockin"}
                  </p>
                  <p className="truncate text-sm text-camp-charcoal/60">{lastMessage.content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[10px] text-camp-charcoal/40 uppercase">
                    {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true, locale: fr })}
                  </span>
                  {unreadCount > 0 ? (
                    <span className="flex size-5 items-center justify-center bg-camp-gold font-mono text-[10px] font-bold text-camp-charcoal">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
