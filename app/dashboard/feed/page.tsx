import Link from "next/link";

import { requireLockinOnboarded } from "@/lib/auth";
import { getFeedPosts } from "@/lib/actions/feed";
import { LOCKIN_TAGS } from "@/lib/social/data";
import { PostComposer } from "@/components/social/post-composer";
import { PostCard } from "@/components/social/post-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sport?: string; country?: string }>;
}) {
  await requireLockinOnboarded();
  const { tag, sport, country } = await searchParams;
  const posts = await getFeedPosts({ tag, sport, country });

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
          Lockin Social Club
        </p>
        <h1 className="font-display mb-6 text-3xl text-lk-black sm:text-4xl">
          Feed
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterPill href="/dashboard/feed" active={!tag}>
            Tout
          </FilterPill>
          {LOCKIN_TAGS.map((t) => (
            <FilterPill key={t} href={`/dashboard/feed?tag=${t}`} active={tag === t}>
              {t}
            </FilterPill>
          ))}
        </div>

        <PostComposer />

        <div>
          {posts.length === 0 ? (
            <p className="py-10 text-center text-xs text-lk-stone-3 uppercase">
              Aucun post pour l&apos;instant — sois le premier à publier.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors",
        active
          ? "border-lk-line bg-camp-charcoal text-camp-white"
          : "border-camp-hairline text-lk-stone-3 hover:border-lk-line hover:text-camp-charcoal",
      )}
    >
      {children}
    </Link>
  );
}
