import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.email !== 'tgordon1@icloud.com') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { plan?: string; credits?: number; addCredits?: number };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { plan, credits, addCredits } = body;

  if (plan !== undefined && !["free", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan value" }, { status: 400 });
  }
  if (credits !== undefined && (typeof credits !== "number" || credits < 0 || !Number.isInteger(credits))) {
    return NextResponse.json({ error: "Credits must be a non-negative integer" }, { status: 400 });
  }
  if (addCredits !== undefined && (typeof addCredits !== "number" || !Number.isInteger(addCredits))) {
    return NextResponse.json({ error: "addCredits must be an integer" }, { status: 400 });
  }

  const exists = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (plan !== undefined) data.plan = plan;
  if (credits !== undefined) data.credits = credits;
  if (addCredits !== undefined) data.credits = { increment: addCredits };

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, email: true, plan: true, credits: true },
  });

  return NextResponse.json({ user });
}
