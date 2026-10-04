CREATE TYPE "public"."camp_registration_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TABLE "camp_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"sport_choices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"excursion_choices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "camp_registration_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"destination" text DEFAULT 'Phuket' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"price_per_person" numeric(10, 2) NOT NULL,
	"total_spots" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "camp_sessions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "camp_registrations" ADD CONSTRAINT "camp_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_registrations" ADD CONSTRAINT "camp_registrations_session_id_camp_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."camp_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "camp_registrations_user_session_idx" ON "camp_registrations" USING btree ("user_id","session_id");