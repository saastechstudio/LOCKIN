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
 * The subscription paywall only takes effect once Stripe is actually
 * configured (real keys + price IDs set). Until then every signed-in
 * member keeps full access — never lock the app out before billing is
 * wired up.
 */
export function requiresSubscription(): boolean {
  return isStripeConfigured;
}
