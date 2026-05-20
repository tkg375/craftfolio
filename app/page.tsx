import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const features = [
  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "ATS Score", desc: "See exactly how your resume ranks against Applicant Tracking Systems before a human ever reads it." },
  { icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", title: "Keyword Gap", desc: "Instantly see which keywords the job requires that your resume is missing — and where to add them." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Impact Score", desc: "Measures whether your bullets describe real outcomes or just responsibilities. Low scores lose hiring managers fast." },
  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", title: "Cover Letter", desc: "A professional, tailored cover letter written specifically for the job — based on your resume." },
  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Resume Rewrite", desc: "A fully rewritten, ATS-optimized resume in your chosen template with every suggestion applied." },
  { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", title: "Career Pivot", desc: "Entering a new field? We rewrite your resume to position your experience for a completely different career." },
];

const steps = [
  { n: "01", label: "Upload your resume", sub: "PDF or paste text" },
  { n: "02", label: "Choose your goal", sub: "Score, rewrite, pivot, or explore careers" },
  { n: "03", label: "Get results instantly", sub: "AI-powered analysis in seconds" },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="relative w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)", boxShadow: "0 4px 12px rgba(220,38,38,0.35)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 12h6M9 8h6M9 16h4M5 20h14a2 2 0 002-2V6l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">Craftfolio</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Dashboard</Link>
              <Link href="/resume-help" className="text-sm font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)" }}>
                Analyze Resume
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Sign In</Link>
              <Link href="/resume-help" className="text-sm font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)" }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4 text-center">
        {/* Background glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #E8647C, transparent)" }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #DC2626, transparent)" }} />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-semibold" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            AI-Powered Resume Tools
          </div>

          {/* Wordmark / logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: "linear-gradient(135deg, #E8647C 0%, #DC2626 60%, #991B1B 100%)", boxShadow: "0 12px 40px rgba(220,38,38,0.45), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow">
                <path d="M9 12h6M9 8h6M9 16h4M5 20h14a2 2 0 002-2V6l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.05] tracking-tight">
            Your resume,{" "}
            <span className="relative inline-block">
              <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #E8647C, #DC2626, #991B1B)" }}>
                crafted to win
              </span>
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            ATS score, keyword gap analysis, tailored cover letters, and a fully rewritten resume — all from one upload. Three analyses free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/resume-help"
              className="font-bold px-8 py-4 rounded-2xl text-white text-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)", boxShadow: "0 8px 32px rgba(220,38,38,0.40)" }}>
              Analyze My Resume — Free
            </Link>
            {!session && (
              <Link href="/login"
                className="font-semibold px-8 py-4 rounded-2xl text-slate-700 hover:text-slate-900 text-lg transition-colors"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
                Sign In
              </Link>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["ATS Score", "Keyword Gap", "Impact Score", "Cover Letter", "Resume Rewrite", "Career Pivot", "Career Options"].map(f => (
              <span key={f} className="text-sm font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(220,38,38,0.07)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.15)" }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4" style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">How it works</h2>
          <p className="text-slate-600">Three steps. Under a minute.</p>
        </div>
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6">
          {steps.map(({ n, label, sub }) => (
            <div key={n} className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-4xl font-black mb-3" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #E8647C, #DC2626)" }}>{n}</div>
              <p className="font-bold text-slate-900 mb-1">{label}</p>
              <p className="text-sm text-slate-600">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Everything you need to get hired</h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">One tool. Six powerful features. No fluff.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 group hover:scale-[1.02] transition-transform" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: "rgba(220,38,38,0.10)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "#DC2626" }}>
                    <path d={icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, #1e0a0a 0%, #3b0f0f 50%, #1e0a0a 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to land your next role?</h2>
          <p className="text-red-200 mb-8 text-lg">Three free analyses. No credit card required.</p>
          <Link href="/resume-help"
            className="inline-block font-bold px-10 py-4 rounded-2xl text-white text-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)", boxShadow: "0 8px 32px rgba(220,38,38,0.50)" }}>
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-slate-500" style={{ background: "var(--bg-footer)", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 12h6M9 8h6M9 16h4M5 20h14a2 2 0 002-2V6l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-slate-700">Craftfolio</span>
        </div>
        <p>© {new Date().getFullYear()} Craftfolio. All rights reserved.</p>
      </footer>
    </div>
  );
}
