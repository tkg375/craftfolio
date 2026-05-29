import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const db = await getDb();
  if (!session) redirect("/login");

  // Delete analyses older than 24 hours for this user
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.analysis.deleteMany({ where: { userId: session.id, createdAt: { lt: cutoff } } });

  const analyses = await db.analysis.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, title: true, createdAt: true },
  });

  return (
    <DashboardClient
      user={{ id: session.id, email: session.email, plan: session.plan, credits: session.credits, subscriptionStatus: session.subscriptionStatus }}
      analyses={analyses.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))}
    />
  );
}
