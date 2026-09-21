import "server-only";
import Stripe from "stripe";

let cachedStripe: Stripe | null = null;

/**
 * Lazily constructs the Stripe client so pages that merely import this
 * module (settings, webhook route) don't crash when Stripe isn't configured
 * yet — only code paths that actually call Stripe need the key.
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!cachedStripe) {
    cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return cachedStripe;
}

export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export const PRICE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
export const PRICE_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;
