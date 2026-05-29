import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE_NAME = "craftfolio_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", getSecret() as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

export async function createSessionToken(userId: string): Promise<string> {
  const payload = `${userId}:${Date.now()}`;
  const sig = await sign(payload);
  return toBase64Url(`${payload}.${sig}`);
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const decoded = fromBase64Url(token);
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = await sign(payload);
    if (expected !== sig) return null;
    const [userId, tsStr] = payload.split(":");
    if (!userId || !tsStr) return null;
    const issuedAt = parseInt(tsStr, 10);
    if (Date.now() - issuedAt > MAX_AGE * 1000) return null;
    return userId;
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
  const userId = await verifySessionToken(token);
  if (!userId) return null;
  const db = await getDb();
  const user = await db.user.findUnique({ where: { id: userId } });
  return user ?? null;
}
