import "server-only";

import { and, asc, desc, eq, lte } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { postMedia, posts } from "@/db/schema";
import { isPostCategory, type MediaType, type Post } from "@/domain/post";

import { seedPosts } from "./seed-posts";

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
      alt: media.alt,
      width: media.width,
      height: media.height,
      position: media.position,
    })),
  };
}

export async function getPosts(): Promise<Post[]> {
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
  const database = getDatabase();
  if (!database) return seedPosts.find((post) => post.slug === slug) ?? null;

  try {
    const row = await database.query.posts.findFirst({
      where: and(
        eq(posts.slug, slug),
        eq(posts.status, "published"),
        lte(posts.publishedAt, new Date()),
      ),
      with: {
        media: {
          orderBy: [asc(postMedia.position)],
        },
      },
    });

    return row ? mapPost(row) : null;
  } catch (cause) {
    throw new Error("Could not load the post.", { cause });
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  const database = getDatabase();
  if (!database) return seedPosts.map((post) => post.slug);

  try {
    const rows = await database
      .select({ slug: posts.slug })
      .from(posts)
      .where(and(eq(posts.status, "published"), lte(posts.publishedAt, new Date())))
      .orderBy(desc(posts.publishedAt));

    return rows.map(({ slug }) => slug);
  } catch (cause) {
    throw new Error("Could not load post slugs.", { cause });
  }
}
