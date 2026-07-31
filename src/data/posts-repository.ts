import "server-only";

import type { Database } from "@/lib/supabase/database.types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { isPostCategory, type MediaType, type Post } from "@/domain/post";

import { seedPosts } from "./seed-posts";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type MediaRow = Database["public"]["Tables"]["post_media"]["Row"];
type PostRecord = PostRow & { post_media: MediaRow[] };

const postSelection = `
  id,
  slug,
  title,
  creator_name,
  creator_handle,
  creator_url,
  creator_avatar_url,
  description,
  category,
  industries,
  colors,
  styles,
  source_url,
  status,
  published_at,
  created_at,
  updated_at,
  post_media (
    id,
    post_id,
    type,
    url,
    poster_url,
    alt,
    width,
    height,
    position,
    created_at
  )
`;

function mapPost(row: PostRecord): Post {
  if (!isPostCategory(row.category)) {
    throw new Error(`Unsupported post category: ${row.category}`);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    creatorName: row.creator_name,
    creatorHandle: row.creator_handle ?? undefined,
    creatorUrl: row.creator_url ?? undefined,
    creatorAvatarUrl: row.creator_avatar_url,
    description: row.description,
    category: row.category,
    industries: row.industries,
    colors: row.colors,
    styles: row.styles,
    sourceUrl: row.source_url,
    publishedAt: row.published_at ?? row.created_at,
    media: row.post_media
      .map((media) => ({
        id: media.id,
        type: media.type as MediaType,
        url: media.url,
        posterUrl: media.poster_url ?? undefined,
        alt: media.alt,
        width: media.width,
        height: media.height,
        position: media.position,
      }))
      .sort((a, b) => a.position - b.position),
  };
}

export async function getPosts(): Promise<Post[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return seedPosts;

  const { data, error } = await supabase
    .from("posts")
    .select(postSelection)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("position", { referencedTable: "post_media", ascending: true });

  if (error) throw new Error(`Could not load posts: ${error.message}`);

  return (data as PostRecord[]).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return seedPosts.find((post) => post.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("posts")
    .select(postSelection)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(`Could not load post: ${error.message}`);

  return data ? mapPost(data as PostRecord) : null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return seedPosts.map((post) => post.slug);

  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error(`Could not load post slugs: ${error.message}`);

  return data.map(({ slug }) => slug);
}
