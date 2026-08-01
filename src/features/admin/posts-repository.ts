import "server-only";

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

  return database.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(posts)
      .values({
        ...postValues(input),
        publishedAt: input.status === "published" ? now : null,
        archivedAt: null,
        createdBy: actorId,
        updatedBy: actorId,
      })
      .returning({ id: posts.id, slug: posts.slug });

    if (!created) throw new Error("The post could not be created.");

    await transaction.insert(postMedia).values(mediaValues(created.id, input));
    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "post.created",
      resourceType: "post",
      resourceId: created.id,
      details: { slug: created.slug, status: input.status },
    });

    return created;
  });
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

  return database.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(posts)
      .set({
        ...postValues(input),
        publishedAt,
        archivedAt: null,
        updatedBy: actorId,
        updatedAt: now,
      })
      .where(eq(posts.id, id))
      .returning({ id: posts.id, slug: posts.slug });

    if (!updated) throw new Error("The post could not be updated.");

    await transaction.delete(postMedia).where(eq(postMedia.postId, id));
    await transaction.insert(postMedia).values(mediaValues(id, input));
    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "post.updated",
      resourceType: "post",
      resourceId: id,
      details: {
        previousSlug: existing.slug,
        slug: updated.slug,
        previousStatus: existing.status,
        status: input.status,
      },
    });

    return { ...updated, previousSlug: existing.slug, removedManagedMedia };
  });
}

export async function archiveAdminPost(id: string, actorId: string) {
  const database = requireDatabase();
  const now = new Date();

  return database.transaction(async (transaction) => {
    const [archived] = await transaction
      .update(posts)
      .set({ status: "archived", archivedAt: now, updatedAt: now, updatedBy: actorId })
      .where(and(eq(posts.id, id), ne(posts.status, "archived")))
      .returning({ id: posts.id, slug: posts.slug });

    if (!archived) throw new Error("Only active posts can be archived.");

    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "post.archived",
      resourceType: "post",
      resourceId: id,
      details: { slug: archived.slug },
    });

    return archived;
  });
}

export async function deleteArchivedPost(id: string, actorId: string) {
  const database = requireDatabase();
  const existing = await database.query.posts.findFirst({
    where: and(eq(posts.id, id), eq(posts.status, "archived")),
    with: { media: true },
  });

  if (!existing) throw new Error("Archive the post before deleting it permanently.");

  const removedManagedMedia = managedAssets(existing.media);

  return database.transaction(async (transaction) => {
    const [deleted] = await transaction
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.status, "archived")))
      .returning({ id: posts.id, slug: posts.slug });

    if (!deleted) throw new Error("Archive the post before deleting it permanently.");

    await transaction.insert(adminAuditLogs).values({
      actorId,
      action: "post.deleted",
      resourceType: "post",
      resourceId: id,
      details: { slug: deleted.slug },
    });

    return { ...deleted, removedManagedMedia };
  });
}
