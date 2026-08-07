DROP INDEX "posts_published_at_idx";--> statement-breakpoint
DROP INDEX "posts_category_published_at_idx";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "posts"."status" = 'published';--> statement-breakpoint
CREATE INDEX "posts_category_created_at_idx" ON "posts" USING btree ("category","created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "posts"."status" = 'published';--> statement-breakpoint
CREATE INDEX "posts_featured_created_at_idx" ON "posts" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "posts"."status" = 'published' and "posts"."is_featured" = true;