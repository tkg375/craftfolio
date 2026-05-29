import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  let body: { token?: string; password?: string };
  try { body = await req.json() as { token?: string; password?: string }; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { token, password } = body;
  if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const reset = await db.passwordReset.findUnique({ where: { token } });
  if (!reset) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  if (new Date() > reset.expiresAt) {
    await db.passwordReset.delete({ where: { token } });
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await db.user.update({ where: { id: reset.userId }, data: { passwordHash } });
  await db.passwordReset.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
