import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";


export const dynamic = "force-dynamic";

export async function GET() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
  if (!ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getSession();
  if (!session || session.email.trim() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    select: { id: true, email: true, plan: true, credits: true, createdAt: true, subscriptionStatus: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
