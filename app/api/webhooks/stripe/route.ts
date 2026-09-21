import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const stripe = getStripe();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const periodEndTimestamp = subscription.items.data[0]?.current_period_end;

  await db
    .update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeSubscriptionStatus: subscription.status,
      stripeCurrentPeriodEnd: periodEndTimestamp
        ? new Date(periodEndTimestamp * 1000)
        : null,
    })
    .where(eq(users.stripeCustomerId, customerId));
}
