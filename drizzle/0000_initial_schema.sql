CREATE TABLE "post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"type" text DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"poster_url" text,
	"alt" text DEFAULT '' NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_media_type_valid" CHECK ("post_media"."type" in ('image', 'video')),
	CONSTRAINT "post_media_dimensions_valid" CHECK ("post_media"."width" > 0 and "post_media"."height" > 0),
	CONSTRAINT "post_media_position_valid" CHECK ("post_media"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"creator_name" text NOT NULL,
	"creator_handle" text,
	"creator_url" text,
	"creator_avatar_url" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"industries" text[] DEFAULT '{}'::text[] NOT NULL,
	"colors" text[] DEFAULT '{}'::text[] NOT NULL,
	"styles" text[] DEFAULT '{}'::text[] NOT NULL,
	"source_url" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_format" CHECK ("posts"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "posts_title_not_blank" CHECK (length(trim("posts"."title")) > 0),
	CONSTRAINT "posts_category_valid" CHECK ("posts"."category" in ('Web', 'Branding', 'Product', 'Motion', 'Illustration', '3D', 'Print')),
	CONSTRAINT "posts_status_valid" CHECK ("posts"."status" in ('draft', 'published')),
	CONSTRAINT "posts_published_at_required" CHECK ("posts"."status" = 'draft' or "posts"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"consented_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_length" CHECK (length("subscribers"."email") between 3 and 254)
);
--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "post_media_post_position_unique" ON "post_media" USING btree ("post_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at" DESC NULLS LAST) WHERE "posts"."status" = 'published';--> statement-breakpoint
CREATE INDEX "posts_category_published_at_idx" ON "posts" USING btree ("category","published_at" DESC NULLS LAST) WHERE "posts"."status" = 'published';--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_email_unique" ON "subscribers" USING btree ("email");