ALTER TABLE "camp_registrations" ADD COLUMN "member_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "club_registration_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "club_activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "club_free_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_club_registration_id_camp_registrations_id_fk" FOREIGN KEY ("club_registration_id") REFERENCES "public"."camp_registrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_registrations" ADD CONSTRAINT "camp_registrations_member_number_unique" UNIQUE("member_number");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_club_registration_id_unique" UNIQUE("club_registration_id");--> statement-breakpoint
-- Membres déjà entrés dans le club avant l'accès par numéro : ils gardent leur accès, première année offerte à compter de leur rituel.
UPDATE "users" SET "club_activated_at" = "lockin_onboarding_completed_at", "club_free_until" = "lockin_onboarding_completed_at" + interval '1 year' WHERE "lockin_onboarding_completed_at" IS NOT NULL AND "club_activated_at" IS NULL;
