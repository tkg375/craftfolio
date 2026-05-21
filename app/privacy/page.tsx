import Link from "next/link";

export const metadata = { title: "Privacy Policy — Craftfolio" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "#a78bfa", lineHeight: 1.4, display: "block" }}>Craftfolio</span>
        </Link>
        <Link href="/" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          ← Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>Last updated: May 2025</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {[
            { title: "1. Information We Collect", body: "We collect your email address and password (hashed) when you register. When you use the resume tools, we process the content you upload (resume text or PDF) to generate your analysis. We store your analysis results so you can access your history. Payment information is handled entirely by Stripe — we never store card details." },
            { title: "2. How We Use Your Information", body: "Your email is used for account authentication and transactional communications. Resume content is used solely to generate your requested analysis. We do not use your resume content to train AI models or share it with third parties. Analysis results are stored in your account and accessible only to you." },
            { title: "3. Data Storage", body: "Your data is stored on secure servers (Neon PostgreSQL). We use industry-standard encryption in transit (TLS) and at rest. We retain your data for as long as your account is active." },
            { title: "4. Third-Party Services", body: "We use Stripe for payment processing (subject to Stripe's privacy policy), Google Gemini for AI analysis (content is processed per Google's API terms), and AWS for email delivery. These services may process data as part of providing their functionality." },
            { title: "5. Data Sharing", body: "We do not sell, rent, or share your personal data or resume content with any third parties for marketing purposes, ever." },
            { title: "6. Your Rights", body: "You may request deletion of your account and all associated data at any time by contacting support. We will process your request within 30 days." },
            { title: "7. Cookies", body: "We use a single session cookie to keep you logged in. We do not use tracking or advertising cookies." },
            { title: "8. Children's Privacy", body: "Craftfolio is not directed to children under 13. We do not knowingly collect personal information from children." },
            { title: "9. Changes to This Policy", body: "We may update this policy periodically. We will notify you of significant changes by email or a notice on the site." },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-bold mb-2 text-base" style={{ color: "var(--text-primary)" }}>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
          <div>
            <h2 className="font-bold mb-2 text-base" style={{ color: "var(--text-primary)" }}>10. Contact</h2>
            <p>Questions about your data? <Link href="/support" style={{ color: "#a78bfa" }} className="underline hover:opacity-80">Click here</Link> to contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
