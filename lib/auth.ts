import { cookies } from "next/headers";
import { db } from "./db";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "craftfolio_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    if (sign(payload) !== sig) return null;
    const [userId] = payload.split(":");
    return userId ?? null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId } });
  return user ?? null;
}
