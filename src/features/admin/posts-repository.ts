import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, ne } from "drizzle-orm";

import { requireDatabase } from "@/db/client";
import { adminAuditLogs, postMedia, posts } from "@/db/schema";
import type { MediaType } from "@/domain/post";

import type {
  AdminPostInput,
  AdminPostRecord,
  AdminPostStatus,
  ManagedMediaAsset,
} from "./types";

type PostRow = typeof posts.$inferSelect;
type MediaRow = typeof postMedia.$inferSelect;

function mapAdminPost(row: PostRow & { media: MediaRow[] }): AdminPostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creatorName,
    creatorHandle: row.creatorHandle ?? undefined,
    creatorUrl: row.creatorUrl ?? undefined,
    creatorAvatarUrl: row.creatorAvatarUrl,
    description: row.description,
    category: row.category as AdminPostRecord["category"],
    industries: row.industries,
    colors: row.colors,
    styles: row.styles,
    sourceUrl: row.sourceUrl,
    status: row.status as AdminPostStatus,
    publishedAt: row.publishedAt?.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    media: row.media.map((media) => ({
      type: media.type as MediaType,
      url: media.url,
      posterUrl: media.posterUrl ?? undefined,
      storageProvider:
        media.storageProvider === "cloudinary" ? media.storageProvider : undefined,
      storageKey: media.storageKey ?? undefined,
      alt: media.alt,
      width: media.width,
      height: media.height,
    })),
  };
}

function mediaValues(postId: string, input: AdminPostInput) {
  return input.media.map((media, position) => ({
    postId,
    type: media.type,
    url: media.url,
    posterUrl: media.posterUrl,
    storageProvider: media.storageProvider,
    storageKey: media.storageKey,
    alt: media.alt,
    width: media.width,
    height: media.height,
    position,
  }));
}

function managedAssets(media: MediaRow[]): ManagedMediaAsset[] {
  return media.flatMap((item) =>
    item.storageProvider === "cloudinary" && item.storageKey
      ? [
          {
            storageProvider: item.storageProvider,
            storageKey: item.storageKey,
            type: item.type as MediaType,
          },
        ]
      : [],
  );
}

function postValues(input: AdminPostInput) {
  return {
    slug: input.slug,
    title: input.title,
    creatorName: input.creatorName,
    creatorHandle: input.creatorHandle,
    creatorUrl: input.creatorUrl,
    creatorAvatarUrl: input.creatorAvatarUrl,
    description: input.description,
    category: input.category,
    industries: input.industries,
    colors: input.colors,
    styles: input.styles,
    sourceUrl: input.sourceUrl,
    status: input.status,
  };
}

export async function getAdminPosts() {
  const database = requireDatabase();
  const rows = await database.query.posts.findMany({
    orderBy: [desc(posts.updatedAt)],
    with: { media: { orderBy: [asc(postMedia.position)] } },
  });

  return rows.map(mapAdminPost);
}

export async function getAdminPostById(id: string) {
  const database = requireDatabase();
  const row = await database.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { media: { orderBy: [asc(postMedia.position)] } },
  });

  return row ? mapAdminPost(row) : null;
}

export async function createAdminPost(input: AdminPostInput, actorId: string) {
  const database = requireDatabase();
  const now = new Date();
  const id = randomUUID();

  await database.batch([
    database.insert(posts).values({
      id,
      ...postValues(input),
      publishedAt: input.status === "published" ? now : null,
      archivedAt: null,
      createdBy: actorId,
      updatedBy: actorId,
    }),
    database.insert(postMedia).values(mediaValues(id, input)),
    database.insert(adminAuditLogs).values({
      actorId,
      action: "post.created",
      resourceType: "post",
      resourceId: id,
      details: { slug: input.slug, status: input.status },
    }),
  ]);

  return { id, slug: input.slug };
}

export async function updateAdminPost(
  id: string,
  input: AdminPostInput,
  actorId: string,
) {
  const database = requireDatabase();
  const existing = await database.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { media: true },
  });

  if (!existing) throw new Error("Post not found.");

  const now = new Date();
  const publishedAt =
    input.status === "published" ? (existing.publishedAt ?? now) : null;
  const retainedStorageKeys = new Set(
    input.media.flatMap((media) => (media.storageKey ? [media.storageKey] : [])),
  );
  const removedManagedMedia = managedAssets(existing.media).filter(
    (media) => !retainedStorageKeys.has(media.storageKey),
  );

  await database.batch([
    database
      .update(posts)
      .set({
        ...postValues(input),
        publishedAt,
        archivedAt: null,
        updatedBy: actorId,
        updatedAt: now,
      })
      .where(eq(posts.id, id)),
    database.delete(postMedia).where(eq(postMedia.postId, id)),
    database.insert(postMedia).values(mediaValues(id, input)),
    database.insert(adminAuditLogs).values({
      actorId,
      action: "post.updated",
      resourceType: "post",
      resourceId: id,
      details: {
        previousSlug: existing.slug,
        slug: input.slug,
        previousStatus: existing.status,
        status: input.status,
      },
    }),
  ]);

  return {
    id,
    slug: input.slug,
    previousSlug: existing.slug,
    removedManagedMedia,
  };
}

export async function archiveAdminPost(id: string, actorId: string) {
  const database = requireDatabase();
  const now = new Date();
  const existing = await database.query.posts.findFirst({
    where: and(eq(posts.id, id), ne(posts.status, "archived")),
    columns: { id: true, slug: true },
  });

  if (!existing) throw new Error("Only active posts can be archived.");

  await database.batch([
    database
      .update(posts)
      .set({ status: "archived", archivedAt: now, updatedAt: now, updatedBy: actorId })
      .where(and(eq(posts.id, id), ne(posts.status, "archived"))),
    database.insert(adminAuditLogs).values({
      actorId,
      action: "post.archived",
      resourceType: "post",
      resourceId: id,
      details: { slug: existing.slug },
    }),
  ]);

  return existing;
}

export async function deleteArchivedPost(id: string, actorId: string) {
  const database = requireDatabase();
  const existing = await database.query.posts.findFirst({
    where: and(eq(posts.id, id), eq(posts.status, "archived")),
    with: { media: true },
  });

  if (!existing) throw new Error("Archive the post before deleting it permanently.");

  const removedManagedMedia = managedAssets(existing.media);

  await database.batch([
    database
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.status, "archived"))),
    database.insert(adminAuditLogs).values({
      actorId,
      action: "post.deleted",
      resourceType: "post",
      resourceId: id,
      details: { slug: existing.slug },
    }),
  ]);

  return { id: existing.id, slug: existing.slug, removedManagedMedia };
}
