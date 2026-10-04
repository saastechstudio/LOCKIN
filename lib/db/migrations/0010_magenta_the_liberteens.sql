DROP INDEX "camp_registrations_user_session_idx";--> statement-breakpoint
ALTER TABLE "camp_registrations" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "camp_registrations_session_email_idx" ON "camp_registrations" USING btree ("session_id","email");