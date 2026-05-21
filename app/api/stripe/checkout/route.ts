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

  // Ensure customer exists
  let customerId = session.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.email });
    customerId = customer.id;
    await db.user.update({ where: { id: session.id }, data: { stripeCustomerId: customerId } });
  }

  if (body.type === "credit") {
    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "1 Resume Analysis Credit", description: "One AI-powered resume analysis on Craftfolio" },
          unit_amount: 100,
        },
        quantity: 1,
      }],
      metadata: { userId: session.id, type: "credit" },
      success_url: `${BASE_URL}/dashboard?credit=1`,
      cancel_url: `${BASE_URL}/resume-help`,
    });
    return NextResponse.json({ url: checkout.url });
  }

  if (body.type === "pro") {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) return NextResponse.json({ error: "Pro plan not configured" }, { status: 500 });

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: session.id, type: "pro" },
      success_url: `${BASE_URL}/dashboard?upgraded=1`,
      cancel_url: `${BASE_URL}/dashboard`,
    });
    return NextResponse.json({ url: checkout.url });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
