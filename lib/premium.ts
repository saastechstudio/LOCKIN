import { isWhopConfigured } from "@/lib/whop";
import type { User } from "@/lib/db/schema";

/**
 * Accounts with complimentary premium access, independent of Whop. Used
 * for the founder/team account and anyone else explicitly comped — checked
 * by email since the row may predate the grant.
 */
const COMPLIMENTARY_ACCESS_EMAILS = new Set(["saastechfr@gmail.com"]);

const ACTIVE_MEMBERSHIP_STATUSES = new Set(["active"]);

export function hasComplimentaryAccess(email: string): boolean {
  return COMPLIMENTARY_ACCESS_EMAILS.has(email.toLowerCase());
}

export function hasPremiumAccess(
  user: Pick<User, "email" | "whopMembershipStatus">,
): boolean {
  return (
    hasComplimentaryAccess(user.email) ||
    (user.whopMembershipStatus !== null &&
      ACTIVE_MEMBERSHIP_STATUSES.has(user.whopMembershipStatus))
  );
}

/**
 * Explicit testing-phase switch: the app is free for every signed-up
 * member right now, so the club can be tested properly before billing
 * goes live. Flip this to `false` when ready to start enforcing the
 * paywall for real — at that point requiresSubscription() falls back to
 * "on once Whop is actually configured", which is what governs
 * production behavior from then on.
 */
const FREE_ACCESS_MODE = true;

/**
 * The subscription paywall only takes effect once FREE_ACCESS_MODE is
 * turned off AND Whop is actually configured (webhook secret + plan IDs
 * set). Until then every signed-in member keeps full access — never
 * lock the app out before billing is deliberately turned on.
 */
export function requiresSubscription(): boolean {
  if (FREE_ACCESS_MODE) return false;
  return isWhopConfigured;
}
