import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { type: "credit" | "pro" };
  try { body = await req.json() as { type: "credit" | "pro" }; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const stripe = getStripe();

  // Ensure Stripe customer exists
  let customerId = session.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.email });
    customerId = customer.id;
    await db.user.update({ where: { id: session.id }, data: { stripeCustomerId: customerId } });
  }

  if (body.type === "credit") {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: 100,
        currency: "usd",
        customer: customerId,
        metadata: { userId: session.id, type: "credit" },
        automatic_payment_methods: { enabled: true },
        description: "1 Resume Analysis Credit — Craftfolio",
      });
      return NextResponse.json({ clientSecret: intent.client_secret, type: "credit" });
    } catch (err) {
      console.error("Credit PaymentIntent error:", err);
      return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
    }
  }

  if (body.type === "pro") {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "Pro plan not configured" }, { status: 500 });

    try {
      const sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
          payment_method_types: ["card"],
        },
        expand: ["latest_invoice.payment_intent"],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = sub.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret ?? null;

      if (!clientSecret) {
        // Subscription may already be active (e.g. free trial or $0 invoice)
        // Fall back to a SetupIntent to collect payment method
        const si = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ["card"],
          metadata: { userId: session.id, type: "pro", subscriptionId: sub.id },
        });
        return NextResponse.json({ clientSecret: si.client_secret, type: "pro_setup", subscriptionId: sub.id });
      }

      return NextResponse.json({ clientSecret, type: "pro", subscriptionId: sub.id });
    } catch (err) {
      console.error("Pro subscription error:", err);
      return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
