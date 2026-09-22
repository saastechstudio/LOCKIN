import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyWhopWebhookSignature } from "@/lib/whop";

const ACTIVE_MEMBERSHIP_EVENTS = new Set(["membership.went_valid", "membership.valid"]);
const INACTIVE_MEMBERSHIP_EVENTS = new Set([
  "membership.went_invalid",
  "membership.invalid",
  "membership.cancelled",
  "membership.canceled",
]);

type WhopEvent = {
  type?: string;
  action?: string;
  data?: Record<string, unknown>;
};

/** Reads the first present string field among several possible payload shapes — Whop's exact field names have shifted across API versions, so this stays defensive rather than betting on one. */
function pickString(obj: Record<string, unknown> | undefined, paths: string[][]): string | null {
  if (!obj) return null;
  for (const path of paths) {
    let value: unknown = obj;
    for (const key of path) {
      if (value && typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = undefined;
        break;
      }
    }
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Whop is not configured" }, { status: 503 });
  }

  const rawBody = await req.text();

  const verified = verifyWhopWebhookSignature({
    rawBody,
    webhookId: req.headers.get("webhook-id"),
    webhookTimestamp: req.headers.get("webhook-timestamp"),
    webhookSignature: req.headers.get("webhook-signature"),
    secret: webhookSecret,
  });
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: WhopEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.type ?? event.action ?? "";
  const data = event.data;

  const email = pickString(data, [
    ["email"],
    ["user", "email"],
    ["member", "email"],
    ["user_email"],
  ]);
  const membershipId = pickString(data, [
    ["id"],
    ["membership_id"],
    ["membership", "id"],
  ]);
  const planId = pickString(data, [["plan_id"], ["plan", "id"]]);

  if (!email) {
    console.error("[webhooks/whop] Could not resolve a member email from event", eventType);
    return NextResponse.json({ received: true, warning: "no email in payload" });
  }

  if (ACTIVE_MEMBERSHIP_EVENTS.has(eventType)) {
    await db
      .update(users)
      .set({
        whopMembershipId: membershipId,
        whopPlanId: planId,
        whopMembershipStatus: "active",
      })
      .where(eq(users.email, email));
  } else if (INACTIVE_MEMBERSHIP_EVENTS.has(eventType)) {
    await db
      .update(users)
      .set({ whopMembershipStatus: "inactive" })
      .where(eq(users.email, email));
  }

  return NextResponse.json({ received: true });
}
