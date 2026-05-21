import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://craftfolio.co";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { type: "credit" | "pro" };
  const stripe = getStripe();

  // Ensure Stripe customer exists
  let customerId = session.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.email });
    customerId = customer.id;
    await db.user.update({ where: { id: session.id }, data: { stripeCustomerId: customerId } });
  }

  if (body.type === "credit") {
    // One-time $1 payment intent
    const intent = await stripe.paymentIntents.create({
      amount: 100,
      currency: "usd",
      customer: customerId,
      metadata: { userId: session.id, type: "credit" },
      automatic_payment_methods: { enabled: true },
      description: "1 Resume Analysis Credit — Craftfolio",
    });
    return NextResponse.json({ clientSecret: intent.client_secret, type: "credit" });
  }

  if (body.type === "pro") {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "Pro plan not configured" }, { status: 500 });

    // Subscription via SetupIntent first, then create subscription server-side after payment confirms
    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = sub.latest_invoice as import("stripe").Stripe.Invoice & {
      payment_intent: import("stripe").Stripe.PaymentIntent;
    };

    return NextResponse.json({
      clientSecret: invoice.payment_intent?.client_secret,
      subscriptionId: sub.id,
      type: "pro",
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
