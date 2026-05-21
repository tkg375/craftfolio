import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  const adminEmail = process.env.ADMIN_EMAIL;
  return NextResponse.json({
    sessionEmail: session?.email ?? null,
    adminEmailSet: !!adminEmail,
    adminEmailLength: adminEmail?.length ?? 0,
    adminEmailFirst4: adminEmail?.slice(0, 4) ?? null,
    match: session?.email === adminEmail,
    matchTrimmed: session?.email?.trim() === adminEmail?.trim(),
  });
}
