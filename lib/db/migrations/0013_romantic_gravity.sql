ALTER TABLE "goals" ADD COLUMN "domain" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "motivation_initiale" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lockin_onboarding_completed_at" timestamp;