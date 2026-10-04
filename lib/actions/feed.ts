"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { postComments, postLikes, posts } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";

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
 * le groupe est déjà le filtre). Charge likes et commentaires en même
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
    likeCount: post.likes.length,
    likedByMe: post.likes.some((l) => l.userId === currentUser.id),
  }));
}

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  imageUrl: z.string().url().max(500).optional().or(z.literal("")),
  tag: z.string().max(40).optional(),
  sport: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  groupId: z.number().int().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(input: CreatePostInput) {
  const user = await getOrCreateDbUser();
  const parsed = createPostSchema.parse(input);

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

export async function toggleLike(postId: number) {
  const user = await getOrCreateDbUser();

  const existing = await db.query.postLikes.findFirst({
    where: and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)),
  });

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

  await db.insert(postComments).values({
    postId: parsed.postId,
    userId: user.id,
    content: parsed.content,
  });

  revalidatePath("/dashboard/feed");
}
