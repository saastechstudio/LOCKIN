"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { addComment, toggleRespect } from "@/lib/actions/feed";
import { LockIcon } from "@/components/lockin/lock-icon";
import { ReportButton } from "@/components/moderation/report-button";

type PostCardUser = {
  id: number;
  name: string | null;
  avatarUrl: string | null;
  lockinLevel: number;
};

type PostCardComment = {
  id: number;
  content: string;
  createdAt: Date;
  user: { id: number; name: string | null; avatarUrl: string | null };
};

type PostCardProps = {
  post: {
    id: number;
    content: string;
    imageUrl: string | null;
    tag: string | null;
    sport: string | null;
    country: string | null;
    createdAt: Date;
    user: PostCardUser;
    comments: PostCardComment[];
    respectCount: number;
    respectedByMe: boolean;
    isMine: boolean;
  };
};

function MiniAvatar({
  user,
  size = "md",
}: {
  user: PostCardUser | PostCardComment["user"];
  size?: "sm" | "md";
}) {
  const initial = (user.name ?? "?").charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-camp-hairline bg-camp-cream text-xs font-bold text-camp-charcoal",
        size === "md" ? "size-9" : "size-7",
      )}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar Clerk, domaine externe non configuré dans next.config (cf. components/ui/avatar.tsx qui fait de même)
        <img src={user.avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

/** Carte de post Lockin — angles droits, aucune ombre, filet fin en séparation, « Respect » au lieu du like. */
export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRespect() {
    startTransition(() => toggleRespect(post.id));
  }

  function handleComment() {
    const value = comment.trim();
    if (!value) return;
    setCommentError(null);
    startTransition(async () => {
      try {
        await addComment({ postId: post.id, content: value });
        setComment("");
      } catch (err) {
        setCommentError(err instanceof Error ? err.message : "Impossible de publier ce commentaire.");
      }
    });
  }

  return (
    <article className="border-b border-camp-hairline py-6">
      <div className="flex items-start gap-3">
        <Link href={`/dashboard/u/${post.user.id}`}>
          <MiniAvatar user={post.user} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href={`/dashboard/u/${post.user.id}`}
              className="text-xs font-semibold tracking-[0.04em] text-camp-charcoal uppercase hover:text-camp-gold"
            >
              {post.user.name ?? "Membre Lockin"}
            </Link>
            <span
              className="inline-flex items-center gap-1 text-[11px] text-lk-stone-3"
              title={`Niveau Lockin ${post.user.lockinLevel}`}
            >
              <LockIcon level={post.user.lockinLevel} className="h-3.5 w-[10.5px]" />
              Niv. {post.user.lockinLevel}
            </span>
            <span className="text-[11px] text-camp-charcoal/40">
              · {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: fr })}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-camp-charcoal">
            {post.content}
          </p>

          {post.imageUrl ? (
            <div className="mt-3 border border-camp-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element -- image hébergée par URL externe arbitraire, non optimisable par next/image sans config de domaine */}
              <img src={post.imageUrl} alt="" className="max-h-[480px] w-full object-cover" />
            </div>
          ) : null}

          {(post.tag || post.sport || post.country) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[post.tag, post.sport, post.country].filter(Boolean).map((t) => (
                <span
                  key={t}
                  className="border border-camp-hairline px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-lk-stone-3 uppercase"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-6">
            {/* Respect, pas de like : aucun cœur, aucun compteur public. Seul l'auteur
                voit combien de membres ont salué son effort. */}
            {post.isMine ? (
              <span className="text-xs text-lk-stone-3">
                {post.respectCount === 0
                  ? "Aucun respect pour l'instant"
                  : `${post.respectCount} respect${post.respectCount > 1 ? "s" : ""}`}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRespect}
                disabled={isPending}
                aria-pressed={post.respectedByMe}
                className={cn(
                  "border px-3 py-1.5 text-xs font-medium transition-colors",
                  post.respectedByMe
                    ? "border-lk-line bg-lk-black text-lk-white"
                    : "border-lk-line text-lk-black hover:border-lk-line",
                )}
              >
                {post.respectedByMe ? "Respect donné" : "Respect"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowComments((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-lk-stone-3 uppercase hover:text-camp-charcoal"
            >
              <MessageSquare className="size-4" />
              {post.comments.length}
            </button>
            <ReportButton targetType="post" targetId={post.id} className="ml-auto" />
          </div>

          {showComments ? (
            <div className="mt-4 space-y-3 border-t border-camp-hairline pt-4">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <MiniAvatar user={c.user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[11px] font-bold text-camp-charcoal uppercase">
                        {c.user.name ?? "Membre Lockin"}
                      </p>
                      <ReportButton targetType="comment" targetId={c.id} />
                    </div>
                    <p className="text-sm text-camp-charcoal/80">{c.content}</p>
                  </div>
                </div>
              ))}
              {commentError ? (
                <p className="border border-lk-line bg-camp-cream px-3 py-2 text-sm text-camp-charcoal">
                  {commentError}
                </p>
              ) : null}
              <div className="flex items-center gap-2 pt-1">
                <input
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setCommentError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Répondre…"
                  className="flex-1 border border-camp-hairline bg-camp-white px-3 py-2 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-lk-line"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={isPending || !comment.trim()}
                  className="border border-lk-line px-3 py-2 text-xs font-bold text-camp-charcoal uppercase disabled:opacity-40"
                >
                  Envoyer
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
