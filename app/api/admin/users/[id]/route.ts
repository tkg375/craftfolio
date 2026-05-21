import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tgordon1@icloud.com";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { plan?: string; credits?: number; addCredits?: number };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { plan, credits, addCredits } = body;

  const data: Record<string, unknown> = {};
  if (plan !== undefined) data.plan = plan;
  if (credits !== undefined) data.credits = credits;
  if (addCredits !== undefined) data.credits = { increment: addCredits };

  const user = await db.user.update({
    where: { id: params.id },
    data,
    select: { id: true, email: true, plan: true, credits: true },
  });

  return NextResponse.json({ user });
}
