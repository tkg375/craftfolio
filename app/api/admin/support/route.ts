import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET() {
  const db = await getDb();
      const session = await getSession();
  if (!session || session.email !== 'tgordon1@icloud.com') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await db.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function PATCH(req: NextRequest) {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.email !== 'tgordon1@icloud.com') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { id?: string; read?: boolean };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.supportMessage.update({ where: { id: body.id }, data: { read: body.read ?? true } });
  return NextResponse.json({ success: true });
}
