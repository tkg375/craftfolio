import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const features = [
  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "ATS Score", desc: "See exactly how your resume ranks before a human ever reads it." },
  { icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", title: "Keyword Gap", desc: "Instantly see which keywords you're missing and where to add them." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Impact Score", desc: "Turn responsibility-based bullets into outcome-driven statements." },
  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", title: "Cover Letter", desc: "A tailored cover letter written from your resume and the job post." },
  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Full Rewrite", desc: "A completely rewritten, ATS-optimized resume in your chosen template." },
  { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", title: "Career Pivot", desc: "Reposition your entire experience for a different industry or role." },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(8,8,15,0.80)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.4, display: "block" }}>Craftfolio</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-bold px-4 py-2 rounded-full text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium transition" style={{ color: "var(--text-muted)" }}>Sign In</Link>
              <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-full text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-36 pb-28 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: "rgba(167,139,250,0.08)" }} />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: "rgba(124,58,237,0.10)" }} />

        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-7xl font-black leading-[1.02] tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Resumes that get{" "}
            <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%)" }}>
              interviews
            </span>
          </h1>

          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            ATS scoring, keyword gap analysis, AI-powered rewrites, and tailored cover letters — all from one upload.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="font-bold px-8 py-4 rounded-2xl text-white text-base transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
              Start for free →
            </Link>
            <Link href="/login"
              className="font-semibold px-8 py-4 rounded-2xl text-base transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Everything in one place</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Six tools. One upload. Zero guessing.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 group transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.20)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent-light)" }}>
                    <path d={icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
          <h2 className="text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Ready to get hired?</h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Create your free account and analyze your first resume in minutes.</p>
          <Link href="/register"
            className="inline-block font-bold px-10 py-4 rounded-2xl text-white text-base transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm" style={{ borderTop: "1px solid var(--border)", color: "var(--text-dim)" }}>
        <div className="flex items-center justify-center mb-2">
          <span style={{ fontFamily: "AmbarPearl", fontSize: "1.5rem", color: "var(--text-dim)", lineHeight: 1 }}>Craftfolio</span>
        </div>
        <p>© {new Date().getFullYear()} Craftfolio. All rights reserved.</p>
      </footer>
    </div>
  );
}
