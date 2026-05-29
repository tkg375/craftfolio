import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { getDb } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  let body: { email?: string; password?: string };
  try { body = await req.json() as { email?: string; password?: string }; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  // Bcrypt hashes start with $2 — can't verify in Workers, prompt reset
  if (user.passwordHash.startsWith("$2")) {
    return NextResponse.json({ error: "Your account requires a password reset. Please use the forgot password link below.", requiresReset: true }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const token = createSessionToken(user.id);
  await setSessionCookie(token);

  return NextResponse.json({ success: true, user: { id: user.id, email: user.email, plan: user.plan, credits: user.credits } });
}
