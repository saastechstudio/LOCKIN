CREATE TYPE "public"."ai_coach_appearance" AS ENUM('masculin', 'feminin', 'neutre', 'minimaliste');--> statement-breakpoint
CREATE TYPE "public"."ai_coach_tone" AS ENUM('bienveillant', 'exigeant', 'scientifique', 'creatif', 'founder_mode');--> statement-breakpoint
CREATE TYPE "public"."ai_coach_visual_style" AS ENUM('friendly_silicon_valley', 'premium_minimaliste', 'dark_mode_founder', 'gradient_mode', 'ultra_minimal');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_coach_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_coach_tone" "ai_coach_tone" DEFAULT 'bienveillant' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_coach_appearance" "ai_coach_appearance" DEFAULT 'neutre' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ai_coach_visual_style" "ai_coach_visual_style" DEFAULT 'friendly_silicon_valley' NOT NULL;