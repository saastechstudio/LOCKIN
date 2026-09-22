ALTER TABLE "users" DROP CONSTRAINT "users_stripe_customer_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_stripe_subscription_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_price_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_subscription_status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_current_period_end";