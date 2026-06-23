import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { getDb } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BLOCKED_DOMAINS = new Set([
  "example.com", "test.com", "mailinator.com", "guerrillamail.com",
  "tempmail.com", "throwam.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de",
  "guerrillamail.net", "guerrillamail.org", "spam4.me", "trashmail.com",
  "trashmail.me", "trashmail.net", "dispostable.com", "yopmail.com",
  "yopmail.fr", "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc",
  "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "10minutemail.com",
  "10minutemail.net", "10minutemail.org", "fakeinbox.com", "mailnull.com",
  "spamgourmet.com", "spamgourmet.net", "spamgourmet.org", "maildrop.cc",
  "discard.email", "spamspot.com", "spamthisplease.com", "fakemail.net",
  "tempinbox.com", "spamfree24.org", "mailexpire.com", "throwam.com",
  "throwaway.email", "tempr.email", "dispostable.com", "mailnesia.com",
  "spamgob.com", "filzmail.com", "tempail.com", "getairmail.com",
  "mt2015.com", "mt2016.com", "spamstack.net", "inoutmail.eu",
]);

export async function POST(req: NextRequest) {
  const db = await getDb();
  try {
    let body: { email?: string; password?: string };
    try { body = await req.json() as { email?: string; password?: string }; }
    catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    const domain = email.toLowerCase().split("@")[1];
    if (!domain || BLOCKED_DOMAINS.has(domain)) return NextResponse.json({ error: "Please use a real email address" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email: email.toLowerCase(), passwordHash },
    });

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, plan: user.plan, credits: user.credits } });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
