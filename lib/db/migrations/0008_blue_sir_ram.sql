CREATE TYPE "public"."mood" AS ENUM('motive', 'normal', 'fatigue', 'stresse');--> statement-breakpoint
ALTER TABLE "daily_focus" ADD COLUMN "mood" "mood";