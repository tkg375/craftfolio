import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { getDb } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  try {
    let body: { email?: string; password?: string };
    try { body = await req.json() as { email?: string; password?: string }; }
    catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email: email.toLowerCase(), passwordHash },
    });

    const token = createSessionToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, plan: user.plan, credits: user.credits } });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
