import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { name, email, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  try {
    const supportEmail = process.env.SUPPORT_EMAIL ?? "support@craftfolio.co";
    await sendEmail({
      to: supportEmail,
      subject: `Craftfolio Support: ${name.trim()}`,
      html: `
        <p><strong>From:</strong> ${escHtml(name.trim())} &lt;${escHtml(email.trim())}&gt;</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escHtml(message.trim())}</p>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support email error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
