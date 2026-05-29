import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import HistoryClient from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getSession();
  const db = await getDb();
  if (!session) redirect("/login");

  const analyses = await db.analysis.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, title: true, createdAt: true },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" className="flex items-center shrink-0" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "clamp(1.4rem, 5vw, 2rem)", color: "#a78bfa", lineHeight: 1.4, display: "block", paddingTop: "4px" }}>Craftfolio</span>
        </Link>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-80"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Analysis History</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{analyses.length} total {analyses.length === 1 ? "analysis" : "analyses"}</p>
        </div>

        <HistoryClient analyses={analyses.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))} />
      </div>
    </div>
  );
}
