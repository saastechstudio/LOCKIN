CREATE TABLE "daily_focus" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"task_description" text NOT NULL,
	"task_completed" boolean DEFAULT false NOT NULL,
	"discipline_rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"psychological_blockers" text NOT NULL,
	"current_routine" text NOT NULL,
	"discipline_level" integer NOT NULL,
	"sector" text NOT NULL,
	"revenue_level" text NOT NULL,
	"business_goals" text NOT NULL,
	"major_goal" text NOT NULL,
	"duration_months" integer NOT NULL,
	"lock_in_blocker" text NOT NULL,
	"roadmap" jsonb NOT NULL,
	"first_week_actions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_focus" ADD CONSTRAINT "daily_focus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_audits" ADD CONSTRAINT "onboarding_audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_focus_user_date_idx" ON "daily_focus" USING btree ("user_id","date");