import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cancel active Stripe subscription before deleting
  if (session.stripeSubscriptionId) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(session.stripeSubscriptionId);
    } catch {
      // Non-fatal — proceed with deletion even if Stripe call fails
    }
  }

  // Deleting the user cascades to Analysis records (onDelete: Cascade in schema)
  await db.user.delete({ where: { id: session.id } });

  await clearSessionCookie();

  return NextResponse.json({ success: true });
}
