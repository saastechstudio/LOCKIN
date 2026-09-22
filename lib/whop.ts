import "server-only";
import crypto from "node:crypto";

/**
 * Lazily read so pages that merely import this module (pricing cards,
 * settings) don't require the env vars to exist — only code paths that
 * actually build a checkout link or verify a webhook need them.
 */
export const isWhopConfigured = Boolean(process.env.WHOP_WEBHOOK_SECRET);

export const WHOP_PLAN_MONTHLY = process.env.NEXT_PUBLIC_WHOP_PLAN_MONTHLY;
export const WHOP_PLAN_YEARLY = process.env.NEXT_PUBLIC_WHOP_PLAN_YEARLY;

/** Whop's hosted checkout is just a direct link to the plan, no API call needed. */
export function whopCheckoutUrl(planId: string): string {
  return `https://whop.com/checkout/${planId}`;
}

/**
 * Verifies a Whop webhook using the Standard Webhooks scheme Whop signs
 * with: signature = base64(HMAC-SHA256(`${id}.${timestamp}.${rawBody}`,
 * secret)), sent as the `webhook-signature` header in the form
 * "v1,<base64>" (space-separated if multiple signatures are present).
 * `secret` is the `whsec_...` value from the Whop dashboard — everything
 * after the `whsec_` prefix, base64-decoded, is the actual HMAC key.
 */
export function verifyWhopWebhookSignature(params: {
  rawBody: string;
  webhookId: string | null;
  webhookTimestamp: string | null;
  webhookSignature: string | null;
  secret: string;
}): boolean {
  const { rawBody, webhookId, webhookTimestamp, webhookSignature, secret } = params;
  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  // Reject stale deliveries (>5 minutes old) to limit replay-attack exposure.
  const timestampSeconds = Number(webhookTimestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret, "base64");

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", key).update(signedContent).digest("base64");

  return webhookSignature
    .split(" ")
    .map((part) => part.split(",")[1])
    .filter((sig): sig is string => Boolean(sig))
    .some((sig) => {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
}
