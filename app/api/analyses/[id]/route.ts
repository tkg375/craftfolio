import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const analysis = await db.analysis.findUnique({ where: { id } });
  if (!analysis || analysis.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let parsed: unknown;
  try { parsed = JSON.parse(analysis.result); }
  catch { return NextResponse.json({ error: "Analysis data is corrupted" }, { status: 500 }); }

  return NextResponse.json({ analysis: { ...analysis, result: parsed } });
}
