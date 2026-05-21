import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import AnalysisViewer from "./AnalysisViewer";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const analysis = await db.analysis.findUnique({ where: { id } });
  if (!analysis || analysis.userId !== session.id) redirect("/dashboard");

  return (
    <AnalysisViewer
      type={analysis.type}
      result={analysis.result}
      createdAt={analysis.createdAt.toISOString()}
    />
  );
}
