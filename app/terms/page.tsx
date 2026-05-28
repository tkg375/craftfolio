import Link from "next/link";

export const metadata = { title: "Terms of Service — Craftfolio" };

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <nav className="fixed top-[40px] inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "#a78bfa", lineHeight: 1.4, display: "block", paddingTop: "4px" }}>Craftfolio</span>
        </Link>
        <Link href="/" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          ← Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>Terms of Service</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>Last updated: May 2025</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {[
            { title: "1. Acceptance of Terms", body: "By creating an account or using Craftfolio, you agree to these Terms of Service. If you do not agree, do not use the service." },
            { title: "2. Description of Service", body: "Craftfolio provides AI-powered resume analysis, rewriting, and career tools. The service is provided \"as is\" and results are intended as guidance only — not professional career or legal advice." },
            { title: "3. Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when registering. We reserve the right to terminate accounts that violate these terms." },
            { title: "4. Credits and Payments", body: "Credits are purchased for $1.00 each and applied to your account balance. Pro subscriptions are billed monthly at $5.00. Credits and subscription fees are non-refundable except where required by law. Pro subscriptions can be cancelled at any time through the billing portal, effective at the end of the billing period." },
            { title: "5. Acceptable Use", body: "You agree not to use Craftfolio to upload content you do not have rights to, to reverse-engineer the service, to attempt unauthorized access, or for any unlawful purpose. We may suspend accounts that violate this policy." },
            { title: "6. Intellectual Property", body: "Craftfolio and its underlying technology are owned by us. Content you upload remains yours. AI-generated outputs (analyses, rewrites, cover letters) are provided for your personal use." },
            { title: "7. Disclaimer of Warranties", body: "The service is provided without warranties of any kind. We do not guarantee that using Craftfolio will result in employment or that analyses will be accurate for all job applications." },
            { title: "8. Limitation of Liability", body: "To the maximum extent permitted by law, Craftfolio shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service." },
            { title: "9. Changes to Terms", body: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the revised terms." },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-bold mb-2 text-base" style={{ color: "var(--text-primary)" }}>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
          <div>
            <h2 className="font-bold mb-2 text-base" style={{ color: "var(--text-primary)" }}>10. Contact</h2>
            <p>Questions about these terms? <Link href="/support" style={{ color: "#a78bfa" }} className="underline hover:opacity-80">Click here</Link> to contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
