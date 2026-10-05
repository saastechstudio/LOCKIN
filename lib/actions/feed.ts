"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { groupMembers, postComments, postLikes, posts } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { assertClubMember, moderateOrThrow } from "@/lib/moderation/enforce";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isHttpsUrl } from "@/lib/safe-url";

export type FeedFilters = {
  tag?: string;
  sport?: string;
  country?: string;
  /** Un groupe précis ; omis = feed global (posts sans groupe uniquement). */
  groupId?: number;
};

/**
 * Feed global (groupId omis — posts sans groupe, filtrables par tag/sport/
 * pays) ou feed d'un groupe précis (groupId fourni — pas d'autres filtres,
 * le groupe est déjà le filtre). Charge respects et commentaires en même
 * temps que les posts — pas de pagination pour l'instant, le volume reste
 * gérable au lancement.
 */
export async function getFeedPosts(filters: FeedFilters = {}) {
  const currentUser = await getOrCreateDbUser();

  const conditions =
    filters.groupId !== undefined
      ? [eq(posts.groupId, filters.groupId)]
      : [
          isNull(posts.groupId),
          filters.tag ? eq(posts.tag, filters.tag) : undefined,
          filters.sport ? eq(posts.sport, filters.sport) : undefined,
          filters.country ? eq(posts.country, filters.country) : undefined,
        ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const rows = await db.query.posts.findMany({
    where: and(...conditions),
    with: {
      user: { columns: { id: true, name: true, avatarUrl: true, lockinLevel: true } },
      likes: { columns: { userId: true } },
      comments: {
        orderBy: (fields, { asc }) => [asc(fields.createdAt)],
        with: {
          user: { columns: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
    orderBy: [desc(posts.createdAt)],
  });

  return rows.map((post) => ({
    ...post,
    respectCount: post.likes.length,
    respectedByMe: post.likes.some((l) => l.userId === currentUser.id),
    isMine: post.userId === currentUser.id,
  }));
}

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  // https uniquement : pas de javascript:, data: ni http en clair dans un <img>.
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || isHttpsUrl(v), "L'image doit être une adresse https.")
    .optional(),
  tag: z.string().max(40).optional(),
  sport: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  groupId: z.number().int().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const user = await getOrCreateDbUser();
  const parsed = createPostSchema.parse(input);
  enforceRateLimit("post", user.id);
  await moderateOrThrow(user, parsed.content);
  if (parsed.groupId !== undefined) {
    // On ne publie que dans un club dont on est membre.
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, parsed.groupId), eq(groupMembers.userId, user.id)),
    });
    if (!membership) throw new Error("Rejoins ce club pour y publier.");
  }

  await db.insert(posts).values({
    userId: user.id,
    content: parsed.content,
    imageUrl: parsed.imageUrl || undefined,
    tag: parsed.tag || undefined,
    sport: parsed.sport || undefined,
    country: parsed.country || undefined,
    groupId: parsed.groupId,
  });

  revalidatePath("/dashboard/feed");
  if (parsed.groupId) revalidatePath(`/dashboard/groupes`);
}

/**
 * « Respect » : la reconnaissance d'un effort, pas un like. Stocké dans
 * post_likes (table historique) ; on ne respecte pas son propre post.
 */
export async function toggleRespect(postId: number) {
  const user = await getOrCreateDbUser();
  assertClubMember(user);
  enforceRateLimit("reaction", user.id);

  const existing = await db.query.postLikes.findFirst({
    where: and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)),
  });
  const post = await db.query.posts.findFirst({ columns: { userId: true }, where: eq(posts.id, postId) });
  if (!post || post.userId === user.id) return;

  if (existing) {
    await db.delete(postLikes).where(eq(postLikes.id, existing.id));
  } else {
    await db.insert(postLikes).values({ postId, userId: user.id });
  }

  revalidatePath("/dashboard/feed");
}

const commentSchema = z.object({
  postId: z.number().int(),
  content: z.string().trim().min(1).max(500),
});

export async function addComment(input: z.infer<typeof commentSchema>) {
  const user = await getOrCreateDbUser();
  const parsed = commentSchema.parse(input);
  enforceRateLimit("comment", user.id);
  await moderateOrThrow(user, parsed.content);
  const post = await db.query.posts.findFirst({ columns: { id: true }, where: eq(posts.id, parsed.postId) });
  if (!post) throw new Error("Ce post n'existe plus.");

  await db.insert(postComments).values({
    postId: parsed.postId,
    userId: user.id,
    content: parsed.content,
  });

  revalidatePath("/dashboard/feed");
}
