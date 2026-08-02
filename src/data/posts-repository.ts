import "server-only";

import { and, asc, desc, eq, lte } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDatabase } from "@/db/client";
import { postMedia, posts } from "@/db/schema";
import { isPostCategory, type MediaType, type Post } from "@/domain/post";

import { seedPosts } from "./seed-posts";

export const PUBLISHED_POSTS_CACHE_TAG = "published-posts";

const PUBLISHED_POSTS_CACHE_LIFE = {
  stale: 300,
  revalidate: 3600,
  expire: 86400,
} as const;

type PostRow = typeof posts.$inferSelect;
type MediaRow = typeof postMedia.$inferSelect;
type PostRecord = PostRow & { media: MediaRow[] };

function mapPost(row: PostRecord): Post {
  if (!isPostCategory(row.category)) {
    throw new Error(`Unsupported post category: ${row.category}`);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creatorName,
    creatorHandle: row.creatorHandle ?? undefined,
    creatorUrl: row.creatorUrl ?? undefined,
    creatorAvatarUrl: row.creatorAvatarUrl,
    description: row.description,
    category: row.category,
    industries: row.industries,
    colors: row.colors,
    styles: row.styles,
    sourceUrl: row.sourceUrl,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    media: row.media.map((media) => ({
      id: media.id,
      type: media.type as MediaType,
      url: media.url,
      posterUrl: media.posterUrl ?? undefined,
      storageProvider:
        media.storageProvider === "cloudinary" ? media.storageProvider : undefined,
      alt: media.alt,
      width: media.width,
      height: media.height,
      position: media.position,
    })),
  };
}

export async function getPosts(): Promise<Post[]> {
  "use cache";

  cacheLife(PUBLISHED_POSTS_CACHE_LIFE);
  cacheTag(PUBLISHED_POSTS_CACHE_TAG);

  const database = getDatabase();
  if (!database) return seedPosts;

  try {
    const rows = await database.query.posts.findMany({
      where: and(eq(posts.status, "published"), lte(posts.publishedAt, new Date())),
      orderBy: [desc(posts.publishedAt)],
      with: {
        media: {
          orderBy: [asc(postMedia.position)],
        },
      },
    });

    return rows.map(mapPost);
  } catch (cause) {
    throw new Error("Could not load posts.", { cause });
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const publishedPosts = await getPosts();
  return publishedPosts.find((post) => post.slug === slug) ?? null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const publishedPosts = await getPosts();
  return publishedPosts.map((post) => post.slug);
}
