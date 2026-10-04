CREATE TYPE "public"."moderation_action" AS ENUM('warning', 'block_24h', 'suspend_7d', 'ban');--> statement-breakpoint
CREATE TYPE "public"."moderation_source" AS ENUM('auto_filter', 'report', 'manual');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('insulte', 'harcelement', 'discrimination', 'spam', 'autre');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('post', 'comment', 'message', 'help_answer');--> statement-breakpoint
CREATE TABLE "moderation_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"source" "moderation_source" NOT NULL,
	"reason" text NOT NULL,
	"content_snapshot" text,
	"action" "moderation_action",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"reported_user_id" integer NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" integer NOT NULL,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "respect_score" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "strike_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;