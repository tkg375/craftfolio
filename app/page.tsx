import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Craftfolio — AI Resume Builder & ATS Score Checker",
  description: "Upload your resume and get an ATS score, keyword gap report, impact score, tailored cover letter, and a fully rewritten resume — in seconds. Free to start, no credit card required.",
  alternates: { canonical: "https://www.craftfolio.co" },
  openGraph: {
    title: "Craftfolio — AI Resume Builder & ATS Score Checker",
    description: "Upload your resume and get an ATS score, keyword gap report, tailored cover letter, and a fully rewritten resume in seconds.",
    url: "https://www.craftfolio.co",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.craftfolio.co/#website",
      url: "https://www.craftfolio.co",
      name: "Craftfolio",
      description: "AI-powered resume builder, ATS optimizer, and career tools.",
    },
    {
      "@type": "Organization",
      "@id": "https://www.craftfolio.co/#organization",
      name: "Craftfolio",
      url: "https://www.craftfolio.co",
    },
    {
      "@type": "SoftwareApplication",
      name: "Craftfolio",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "3 free credits at signup" },
      featureList: [
        "ATS Resume Score",
        "Keyword Gap Analysis",
        "Impact Score",
        "AI Cover Letter Generator",
        "Full Resume Rewrite",
        "Career Pivot Tool",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is an ATS score?", acceptedAnswer: { "@type": "Answer", text: "ATS stands for Applicant Tracking System — software that employers use to filter resumes before a human reads them. Your ATS score reflects how well your resume is structured and keyword-matched for automated screening." } },
        { "@type": "Question", name: "How many free credits do I get?", acceptedAnswer: { "@type": "Answer", text: "You get 3 free credits when you sign up — no credit card required. Each credit covers one full AI analysis." } },
        { "@type": "Question", name: "Can the AI rewrite my resume?", acceptedAnswer: { "@type": "Answer", text: "Yes. The Full Rewrite feature produces a completely new, ATS-optimized resume formatted in your choice of templates and downloadable as a PDF." } },
      ],
    },
  ],
};

const features = [
  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "ATS Score", desc: "See exactly how your resume ranks before a human ever reads it." },
  { icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", title: "Keyword Gap", desc: "Instantly see which keywords you're missing and where to add them." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Impact Score", desc: "Turn responsibility-based bullets into outcome-driven statements." },
  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", title: "Cover Letter", desc: "A tailored cover letter written from your resume and the job post." },
  { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", title: "Full Rewrite", desc: "A completely rewritten, ATS-optimized resume in your chosen template." },
  { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", title: "Career Pivot", desc: "Reposition your entire experience for a different industry or role." },
];

const faqs = [
  { q: "What is an ATS score?", a: "ATS stands for Applicant Tracking System — software that employers use to filter resumes before a human ever reads them. Your ATS score reflects how well your resume is structured and keyword-matched for automated screening." },
  { q: "How many credits do I get for free?", a: "You get 3 free credits when you sign up — no credit card required. Each credit covers one AI analysis. Additional credits are $1 each, or upgrade to Pro for unlimited analyses at $5/month." },
  { q: "What file formats are supported?", a: "We accept PDF uploads up to 10MB. You can also paste your resume as plain text if you prefer." },
  { q: "Does the AI actually rewrite my resume?", a: "Yes. The Full Rewrite feature produces a completely new resume using all the suggestions from your analysis, formatted in your choice of 5 ATS-safe templates and downloadable as a PDF." },
  { q: "Can I generate a cover letter?", a: "Yes — paste a job posting URL and Craftfolio will write a tailored cover letter that connects your specific experience to the role's requirements." },
  { q: "Is my resume data private?", a: "Your resume content is used only to generate your analysis and is never shared or sold. We store results so you can access your history, but you can delete your account at any time." },
  { q: "Can I cancel my Pro subscription?", a: "Yes, anytime. Go to Dashboard → Profile → Cancel subscription. You'll keep Pro access through the end of your billing period." },
  { q: "What is Career Pivot?", a: "Career Pivot takes your existing resume and rewrites it to target a completely different industry or role — repositioning your experience so it resonates with hiring managers in the new field." },
];

export default function HomePage() {

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>

        {/* Logo */}
        <Link href="/" style={{ overflow: "visible", flexShrink: 0 }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "#a78bfa", lineHeight: 1.4, display: "block", paddingTop: "4px" }}>Craftfolio</span>
        </Link>

        {/* Centered nav links */}
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {[["#how-it-works","How it Works"],["#pricing","Pricing"],["#faqs","FAQs"],["#about","About"]].map(([href,label]) => (
            <a key={href} href={href} className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: "var(--text-muted)" }}>{label}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <>
            <Link href="/login" className="text-sm font-medium transition hidden sm:block" style={{ color: "var(--text-muted)" }}>Sign In</Link>
            <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
              Get Started
            </Link>
          </>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
        <div className="absolute top-40 left-1/4 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: "rgba(167,139,250,0.08)" }} />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full pointer-events-none blur-3xl" style={{ background: "rgba(124,58,237,0.10)" }} />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Resumes that get{" "}
            <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%)" }}>
              interviews
            </span>
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            ATS scoring, keyword gap analysis, AI-powered rewrites, and tailored cover letters — all from one upload.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="font-bold px-8 py-4 rounded-2xl text-white text-base transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
              Start for free →
            </Link>
            <Link href="/login" className="font-semibold px-8 py-4 rounded-2xl text-base transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Everything in one place</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Six tools. One upload. Zero guessing.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
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

      {/* How it Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>How it works</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Three steps. Under a minute. Results that actually help.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload your resume",
                desc: "Drop a PDF or paste your resume text. That's it — no formatting required, no templates to fill out.",
                icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
              },
              {
                step: "02",
                title: "AI analyzes in seconds",
                desc: "Our AI scores your resume across ATS compatibility, keyword coverage, and impact — then compares it against the job you're targeting.",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
              },
              {
                step: "03",
                title: "Get your results",
                desc: "Receive a full report with plain-English explanations, a rewritten resume, a tailored cover letter, and career recommendations — all ready to use.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center relative"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" style={{ color: "#a78bfa" }}>
                    <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: "#7c3aed", color: "#fff" }}>{step.replace("0","")}</span>
                </div>
                <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/register" className="inline-block font-bold px-8 py-4 rounded-2xl text-white text-base transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
              Try it free — no card required
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Simple pricing</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Pay as you go, or go unlimited.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl p-8 flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "var(--text-muted)" }}>PAY AS YOU GO</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black" style={{ color: "var(--text-primary)" }}>$1</span>
                <span className="text-base mb-2" style={{ color: "var(--text-muted)" }}>/credit</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>One credit = one AI analysis. Buy only what you need.</p>
              <ul className="space-y-2 mb-8 flex-1">
                {["ATS scoring","Keyword gap analysis","Strengths & weaknesses","No subscription required"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ color: "#a78bfa", flexShrink: 0 }}><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center font-bold py-3 rounded-xl transition-all hover:opacity-90"
                style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}>
                Get started free
              </Link>
            </div>
            <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.08))", border: "1px solid rgba(124,58,237,0.35)" }}>
              <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.30)", color: "#c4b5fd" }}>BEST VALUE</div>
              <p className="text-sm font-bold mb-2" style={{ color: "#a78bfa" }}>PRO</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black" style={{ color: "var(--text-primary)" }}>$5</span>
                <span className="text-base mb-2" style={{ color: "var(--text-muted)" }}>/month</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Unlimited analyses every month. Cancel anytime.</p>
              <ul className="space-y-2 mb-8 flex-1">
                {["Unlimited ATS analyses","Full resume rewrites","Tailored cover letters","Career pivot tool","5 professional templates","Cancel anytime"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ color: "#a78bfa", flexShrink: 0 }}><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center font-bold py-3 rounded-xl text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 24px rgba(124,58,237,0.40)" }}>
                Start Pro — $5/mo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-16 sm:py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Frequently asked questions</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>Everything you need to know before you start.</p>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-semibold text-sm"
                  style={{ color: "var(--text-primary)" }}>
                  {q}
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="flex-shrink-0 ml-4 transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }}>
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 sm:py-24 px-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "var(--text-primary)" }}>About Craftfolio</h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
            Craftfolio was built because the job market is broken. Applicant Tracking Systems reject qualified candidates before any human sees their resume — and most people have no idea it's happening.
          </p>
          <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
            We use AI to give every job seeker the same edge that expensive resume writers charge hundreds of dollars for: a clear score, specific fixes, a rewritten resume, and a tailored cover letter — all in under a minute.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            No waiting. No fluff. Just clear, actionable insight that gets you to the interview.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "var(--text-primary)" }}>Ready to get hired?</h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>Create your free account and analyze your first resume in minutes.</p>
          <Link href="/register" className="inline-block font-bold px-10 py-4 rounded-2xl text-white text-base transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 8px 32px rgba(124,58,237,0.45)" }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span style={{ fontFamily: "AmbarPearl", fontSize: "1.5rem", color: "var(--text-dim)", lineHeight: 1 }}>Craftfolio</span>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: "var(--text-dim)" }}>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "var(--text-dim)" }}>© {new Date().getFullYear()} Craftfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
