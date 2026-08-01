import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    creatorName: text("creator_name").notNull(),
    creatorHandle: text("creator_handle"),
    creatorUrl: text("creator_url"),
    creatorAvatarUrl: text("creator_avatar_url").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    industries: text("industries").array().default(sql`'{}'::text[]`).notNull(),
    colors: text("colors").array().default(sql`'{}'::text[]`).notNull(),
    styles: text("styles").array().default(sql`'{}'::text[]`).notNull(),
    sourceUrl: text("source_url").notNull(),
    status: text("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_published_at_idx")
      .on(table.publishedAt.desc())
      .where(sql`${table.status} = 'published'`),
    index("posts_category_published_at_idx")
      .on(table.category, table.publishedAt.desc())
      .where(sql`${table.status} = 'published'`),
    check("posts_slug_format", sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`),
    check("posts_title_not_blank", sql`length(trim(${table.title})) > 0`),
    check(
      "posts_category_valid",
      sql`${table.category} in ('Web', 'Branding', 'Product', 'Motion', 'Illustration', '3D', 'Print')`,
    ),
    check("posts_status_valid", sql`${table.status} in ('draft', 'published')`),
    check(
      "posts_published_at_required",
      sql`${table.status} = 'draft' or ${table.publishedAt} is not null`,
    ),
  ],
);

export const postMedia = pgTable(
  "post_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    type: text("type").default("image").notNull(),
    url: text("url").notNull(),
    posterUrl: text("poster_url"),
    alt: text("alt").default("").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("post_media_post_position_unique").on(table.postId, table.position),
    check("post_media_type_valid", sql`${table.type} in ('image', 'video')`),
    check("post_media_dimensions_valid", sql`${table.width} > 0 and ${table.height} > 0`),
    check("post_media_position_valid", sql`${table.position} >= 0`),
  ],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    source: text("source").default("website").notNull(),
    consentedAt: timestamp("consented_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("subscribers_email_unique").on(table.email),
    check("subscribers_email_length", sql`length(${table.email}) between 3 and 254`),
  ],
);

export const postsRelations = relations(posts, ({ many }) => ({
  media: many(postMedia),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
}));
