import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

import { seedPosts } from "../data/seed-posts";
import { postMedia, posts } from "./schema";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before seeding Neon.");
}

const database = drizzle({ client: neon(connectionString) });

for (const post of seedPosts) {
  const [savedPost] = await database
    .insert(posts)
    .values({
      slug: post.slug,
      title: post.title,
      creatorName: post.creatorName,
      creatorHandle: post.creatorHandle,
      creatorUrl: post.creatorUrl,
      creatorAvatarUrl: post.creatorAvatarUrl,
      description: post.description,
      category: post.category,
      industries: post.industries,
      colors: post.colors,
      styles: post.styles,
      sourceUrl: post.sourceUrl,
      status: "published",
      publishedAt: new Date(post.publishedAt),
    })
    .onConflictDoUpdate({
      target: posts.slug,
      set: {
        title: post.title,
        creatorName: post.creatorName,
        creatorHandle: post.creatorHandle,
        creatorUrl: post.creatorUrl,
        creatorAvatarUrl: post.creatorAvatarUrl,
        description: post.description,
        category: post.category,
        industries: post.industries,
        colors: post.colors,
        styles: post.styles,
        sourceUrl: post.sourceUrl,
        status: "published",
        publishedAt: new Date(post.publishedAt),
        updatedAt: new Date(),
      },
    })
    .returning({ id: posts.id });

  if (!savedPost) throw new Error(`Could not seed post: ${post.slug}`);

  for (const media of post.media) {
    await database
      .insert(postMedia)
      .values({
        postId: savedPost.id,
        type: media.type,
        url: media.url,
        posterUrl: media.posterUrl,
        alt: media.alt,
        width: media.width,
        height: media.height,
        position: media.position,
      })
      .onConflictDoUpdate({
        target: [postMedia.postId, postMedia.position],
        set: {
          type: media.type,
          url: media.url,
          posterUrl: media.posterUrl,
          alt: media.alt,
          width: media.width,
          height: media.height,
        },
      });
  }
}

console.log(`Seeded ${seedPosts.length} posts into Neon.`);
