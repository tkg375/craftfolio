import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResumeScorerClient from "./ResumeScorerClient";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Help — Craftfolio",
  description: "Score, rewrite, and tailor your resume with AI.",
};

export default async function ResumeHelpPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.4, display: "block" }}>Craftfolio</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          ← Dashboard
        </Link>
      </nav>
      {/* Hero header */}
      <div className="relative pt-28 pb-10 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 65%)" }} />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
            Everything you need to get hired —<br className="hidden sm:block" /> in one place
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Upload your resume, paste a job link, and get an ATS score, keyword gap analysis, impact score, career recommendations, a tailored cover letter, and a fully rewritten resume — instantly.
          </p>
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["ATS Score","Keyword Gap","Impact Score","Career Options","Cover Letter","Full Rewrite","Career Pivot","5 Templates"].map(f => (
              <span key={f} className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "var(--accent-light)" }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-10">
        <ResumeScorerClient isLoggedIn={true} />
      </div>
    </div>
  );
}
