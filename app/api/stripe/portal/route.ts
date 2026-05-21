import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://craftfolio.co";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.stripeCustomerId) return NextResponse.json({ error: "No billing account found" }, { status: 400 });

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: session.stripeCustomerId,
    return_url: `${BASE_URL}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
