import { notFound } from "next/navigation";

import { requireLockinOnboarded } from "@/lib/auth";
import { getGroup } from "@/lib/actions/groups";
import { getFeedPosts } from "@/lib/actions/feed";
import { GROUP_TYPE_LABELS } from "@/lib/social/data";
import type { GroupSeed } from "@/lib/social/data";
import { GroupJoinButton } from "@/components/social/group-join-button";
import { PostComposer } from "@/components/social/post-composer";
import { PostCard } from "@/components/social/post-card";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireLockinOnboarded();
  const { slug } = await params;
  const group = await getGroup(slug);
  if (!group) notFound();

  const posts = await getFeedPosts({ groupId: group.id });

  return (
    <div className="camp-scope">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-black/50 uppercase">
          {GROUP_TYPE_LABELS[group.type as GroupSeed["type"]]}
        </p>
        <div className="mb-6 flex flex-col gap-4 border-b-2 border-camp-charcoal pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-lk-black sm:text-4xl">
              {group.name}
            </h1>
            {group.description ? (
              <p className="mt-1 text-sm text-camp-charcoal/60">{group.description}</p>
            ) : null}
            <p className="mt-1 text-[11px] text-camp-charcoal/40">
              {group.memberCount} membre{group.memberCount > 1 ? "s" : ""}
            </p>
          </div>
          <GroupJoinButton groupId={group.id} isMember={group.isMember} />
        </div>

        <PostComposer groupId={group.id} placeholder={`Partage quelque chose avec ${group.name}`} />

        <div>
          {posts.length === 0 ? (
            <p className="py-10 text-center text-xs text-camp-charcoal/50 uppercase">
              Aucun post dans ce groupe pour l&apos;instant.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </div>
  );
}
