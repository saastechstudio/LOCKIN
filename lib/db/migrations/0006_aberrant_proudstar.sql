ALTER TABLE "users" ADD COLUMN "whop_membership_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whop_plan_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whop_membership_status" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whop_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_whop_membership_id_unique" UNIQUE("whop_membership_id");