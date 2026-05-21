import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const analyses = await db.analysis.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, type: true, title: true, createdAt: true },
  });

  return (
    <DashboardClient
      user={{ id: session.id, email: session.email, plan: session.plan, credits: session.credits }}
      analyses={analyses.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))}
    />
  );
}
