import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AnalysisViewer from "./AnalysisViewer";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const db = await getDb();
  if (!session) redirect("/login");

  const { id } = await params;
  const analysis = await db.analysis.findUnique({ where: { id } });
  if (!analysis || analysis.userId !== session.id) redirect("/dashboard");

  let parsedResult: unknown = null;
  try { parsedResult = JSON.parse(analysis.result as string); } catch { parsedResult = null; }

  return (
    <AnalysisViewer
      type={analysis.type}
      result={parsedResult}
      createdAt={analysis.createdAt.toISOString()}
    />
  );
}
