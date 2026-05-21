import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      const userId = cs.metadata?.userId;
      if (!userId) break;

      if (cs.metadata?.type === "credit") {
        await db.user.update({ where: { id: userId }, data: { credits: { increment: 1 } } });
      }

      if (cs.metadata?.type === "pro" && cs.subscription) {
        await db.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeSubscriptionId: String(cs.subscription),
            subscriptionStatus: "active",
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await db.user.findFirst({ where: { stripeCustomerId: String(sub.customer) } });
      if (!customer) break;
      await db.user.update({
        where: { id: customer.id },
        data: {
          plan: sub.status === "active" ? "pro" : "free",
          subscriptionStatus: sub.status,
          stripeSubscriptionId: sub.id,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await db.user.findFirst({ where: { stripeCustomerId: String(sub.customer) } });
      if (!customer) break;
      await db.user.update({
        where: { id: customer.id },
        data: { plan: "free", subscriptionStatus: "canceled", stripeSubscriptionId: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
