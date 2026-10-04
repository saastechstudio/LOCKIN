"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { addComment, toggleLike } from "@/lib/actions/feed";

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
    likeCount: number;
    likedByMe: boolean;
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
        "flex shrink-0 items-center justify-center border border-camp-hairline bg-camp-cream font-mono text-xs font-bold text-camp-charcoal",
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

/** Carte de post brutaliste — pas de coins arrondis, pas d'ombre, filet fin en séparation. */
export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    startTransition(() => toggleLike(post.id));
  }

  function handleComment() {
    const value = comment.trim();
    if (!value) return;
    startTransition(async () => {
      await addComment({ postId: post.id, content: value });
      setComment("");
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
              className="font-mono text-xs font-bold tracking-[0.04em] text-camp-charcoal uppercase hover:text-camp-gold"
            >
              {post.user.name ?? "Membre Lockin"}
            </Link>
            <span className="font-mono text-[11px] text-camp-charcoal/40">
              Niveau {post.user.lockinLevel}
            </span>
            <span className="font-mono text-[11px] text-camp-charcoal/40">
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
                  className="border border-camp-hairline px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-camp-charcoal/70 uppercase"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-6">
            <button
              type="button"
              onClick={handleLike}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase transition-colors",
                post.likedByMe ? "text-camp-gold" : "text-camp-charcoal/50 hover:text-camp-charcoal",
              )}
            >
              <Heart className={cn("size-4", post.likedByMe && "fill-camp-gold")} />
              {post.likeCount}
            </button>
            <button
              type="button"
              onClick={() => setShowComments((s) => !s)}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-camp-charcoal/50 uppercase hover:text-camp-charcoal"
            >
              <MessageCircle className="size-4" />
              {post.comments.length}
            </button>
          </div>

          {showComments ? (
            <div className="mt-4 space-y-3 border-t border-camp-hairline pt-4">
              {post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <MiniAvatar user={c.user} size="sm" />
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-camp-charcoal uppercase">
                      {c.user.name ?? "Membre Lockin"}
                    </p>
                    <p className="text-sm text-camp-charcoal/80">{c.content}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Répondre…"
                  className="flex-1 border border-camp-hairline bg-camp-white px-3 py-2 text-sm text-camp-charcoal outline-none placeholder:text-camp-charcoal/40 focus:border-camp-charcoal"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={isPending || !comment.trim()}
                  className="border-2 border-camp-charcoal px-3 py-2 font-mono text-xs font-bold text-camp-charcoal uppercase disabled:opacity-40"
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
