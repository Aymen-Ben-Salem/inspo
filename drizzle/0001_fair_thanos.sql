CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_audit_logs_actor_not_blank" CHECK (length(trim("admin_audit_logs"."actor_id")) > 0),
	CONSTRAINT "admin_audit_logs_action_not_blank" CHECK (length(trim("admin_audit_logs"."action")) > 0),
	CONSTRAINT "admin_audit_logs_resource_type_valid" CHECK ("admin_audit_logs"."resource_type" in ('post', 'subscriber'))
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_status_valid";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_published_at_required";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "updated_by" text;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "unsubscribed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "admin_audit_logs_actor_created_at_idx" ON "admin_audit_logs" USING btree ("actor_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "subscribers_status_created_at_idx" ON "subscribers" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_archived_at_consistent" CHECK (("posts"."status" = 'archived' and "posts"."archived_at" is not null) or ("posts"."status" <> 'archived' and "posts"."archived_at" is null));--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_status_valid" CHECK ("posts"."status" in ('draft', 'published', 'archived'));--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_published_at_required" CHECK ("posts"."status" <> 'published' or "posts"."published_at" is not null);--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_status_valid" CHECK ("subscribers"."status" in ('active', 'unsubscribed'));--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_unsubscribed_at_consistent" CHECK (("subscribers"."status" = 'unsubscribed' and "subscribers"."unsubscribed_at" is not null) or ("subscribers"."status" = 'active' and "subscribers"."unsubscribed_at" is null));