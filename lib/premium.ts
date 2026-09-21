import { isStripeConfigured } from "@/lib/stripe";
import type { User } from "@/lib/db/schema";

/**
 * Accounts with complimentary premium access, independent of Stripe. Used
 * for the founder/team account and anyone else explicitly comped — checked
 * by email since the row may predate the grant.
 */
const COMPLIMENTARY_ACCESS_EMAILS = new Set(["saastechfr@gmail.com"]);

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function hasComplimentaryAccess(email: string): boolean {
  return COMPLIMENTARY_ACCESS_EMAILS.has(email.toLowerCase());
}

export function hasPremiumAccess(
  user: Pick<User, "email" | "stripeSubscriptionStatus">,
): boolean {
  return (
    hasComplimentaryAccess(user.email) ||
    (user.stripeSubscriptionStatus !== null &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(user.stripeSubscriptionStatus))
  );
}

/**
 * Explicit testing-phase switch: the app is free for every signed-up
 * member right now, so the club can be tested properly before billing
 * goes live. Flip this to `false` when ready to start enforcing the
 * paywall for real — at that point requiresSubscription() falls back to
 * "on once Stripe is actually configured", which is what governs
 * production behavior from then on.
 */
const FREE_ACCESS_MODE = true;

/**
 * The subscription paywall only takes effect once FREE_ACCESS_MODE is
 * turned off AND Stripe is actually configured (real keys + price IDs
 * set). Until then every signed-in member keeps full access — never
 * lock the app out before billing is deliberately turned on.
 */
export function requiresSubscription(): boolean {
  if (FREE_ACCESS_MODE) return false;
  return isStripeConfigured;
}
