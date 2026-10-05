ALTER TYPE "public"."report_target_type" ADD VALUE 'formation';--> statement-breakpoint
CREATE TABLE "formation_chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formation_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"formation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formation_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"formation_id" integer NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formation_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"formation_id" integer NOT NULL,
	"chapter_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formation_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"formation_id" integer NOT NULL,
	"chapter_id" integer,
	"user_id" integer NOT NULL,
	"tried" text NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"next_action" text,
	"answered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formation_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formations" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"theme" text NOT NULL,
	"level" text NOT NULL,
	"duration_hours" integer NOT NULL,
	"price_cents" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "formation_chapters" ADD CONSTRAINT "formation_chapters_module_id_formation_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."formation_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_enrollments" ADD CONSTRAINT "formation_enrollments_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_enrollments" ADD CONSTRAINT "formation_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_modules" ADD CONSTRAINT "formation_modules_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_progress" ADD CONSTRAINT "formation_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_progress" ADD CONSTRAINT "formation_progress_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_progress" ADD CONSTRAINT "formation_progress_chapter_id_formation_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."formation_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_questions" ADD CONSTRAINT "formation_questions_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_questions" ADD CONSTRAINT "formation_questions_chapter_id_formation_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."formation_chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_questions" ADD CONSTRAINT "formation_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formation_resources" ADD CONSTRAINT "formation_resources_chapter_id_formation_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."formation_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formations" ADD CONSTRAINT "formations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "formation_enrollments_formation_user_idx" ON "formation_enrollments" USING btree ("formation_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "formation_progress_user_chapter_idx" ON "formation_progress" USING btree ("user_id","chapter_id");