import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  let body: { email?: string };
  try { body = await req.json() as { email?: string }; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { email } = body;
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true });

  // Delete any existing reset tokens for this user
  await db.passwordReset.deleteMany({ where: { userId: user.id } });

  // Generate token
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = "https://www.craftfolio.co";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your Craftfolio password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="color: #0f172a; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #475569; margin-bottom: 24px;">Click the button below to reset your Craftfolio password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #5b21b6, #7c3aed); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset Password</a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px;">Link: ${resetUrl}</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
