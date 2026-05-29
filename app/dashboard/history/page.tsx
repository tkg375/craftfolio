import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  resume: "ATS Analysis",
  resume_job: "Job Match Analysis",
  resume_rewrite: "Full Rewrite",
  "resume-rewrite": "Full Rewrite",
  career_pivot: "Career Pivot",
  "cover-letter": "Cover Letter",
  cover_letter: "Cover Letter",
};

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

        {analyses.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No analyses yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Upload your resume to get started.</p>
            <Link href="/resume-help"
              className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map(a => {
              const label = TYPE_LABELS[a.type] ?? a.type;
              const date = new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <Link key={a.id} href={`/analyses/${a.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.title ?? label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label} · {date}</p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
