"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getOrCreateDbUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutSession(priceId: string) {
  const user = await getOrCreateDbUser();
  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: String(user.id), clerkId: user.clerkId },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, user.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    allow_promotion_codes: true,
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/?checkout=cancelled`,
  });

  if (!session.url) throw new Error("Stripe checkout session has no URL");
  redirect(session.url);
}

export async function createPortalSession() {
  const user = await getOrCreateDbUser();
  if (!user.stripeCustomerId) {
    redirect("/dashboard/settings?error=no-subscription");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/settings`,
  });

  redirect(session.url);
}
