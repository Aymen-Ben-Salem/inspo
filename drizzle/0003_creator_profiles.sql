CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"handle" text,
	"url" text,
	"avatar_url" text NOT NULL,
	"avatar_storage_provider" text,
	"avatar_storage_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creators_name_not_blank" CHECK (length(trim("creators"."name")) > 0),
	CONSTRAINT "creators_avatar_storage_consistent" CHECK (("creators"."avatar_storage_provider" is null and "creators"."avatar_storage_key" is null) or ("creators"."avatar_storage_provider" = 'cloudinary' and length(trim("creators"."avatar_storage_key")) > 0))
);
--> statement-breakpoint
INSERT INTO "creators" ("name", "handle", "url", "avatar_url")
SELECT DISTINCT "creator_name", "creator_handle", "creator_url",
  CASE
    WHEN "creator_avatar_url" = '/brand/default-avatar.png' THEN '/brand/default-avatar.svg'
    ELSE "creator_avatar_url"
  END
FROM "posts";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "creator_id" uuid;--> statement-breakpoint
UPDATE "posts"
SET "creator_id" = "creators"."id"
FROM "creators"
WHERE "posts"."creator_name" = "creators"."name"
  AND "posts"."creator_handle" IS NOT DISTINCT FROM "creators"."handle"
  AND "posts"."creator_url" IS NOT DISTINCT FROM "creators"."url"
  AND CASE
    WHEN "posts"."creator_avatar_url" = '/brand/default-avatar.png' THEN '/brand/default-avatar.svg'
    ELSE "posts"."creator_avatar_url"
  END = "creators"."avatar_url";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "creators_name_idx" ON "creators" USING btree ("name");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE restrict ON UPDATE no action;
