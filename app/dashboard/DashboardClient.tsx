"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Analysis = { id: string; type: string; title: string | null; createdAt: string };
type User = { id: string; email: string; plan: string; credits: number; subscriptionStatus?: string | null };

const TYPE_LABELS: Record<string, string> = {
  resume: "ATS Analysis",
  "resume-rewrite": "Full Rewrite",
  "cover-letter": "Cover Letter",
};

export default function DashboardClient({ user, analyses }: { user: User; analyses: Analysis[] }) {
  const [tab, setTab] = useState<"overview" | "history" | "profile">("overview");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isPro = user.plan === "pro";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" className="flex items-center" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.4, display: "block" }}>Craftfolio</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/resume-help"
            className="text-sm font-bold px-4 py-2 rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
            Analyze Resume
          </Link>
          <button onClick={handleLogout}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          {(["overview", "history", "profile"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={tab === t
                ? { background: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#fff" }
                : { color: "var(--text-muted)" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Plan" value={isPro ? "Pro" : "Free"} accent={isPro} />
              <StatCard label="Credits Remaining" value={isPro ? "Unlimited" : String(user.credits)} accent={isPro} />
              <StatCard label="Analyses Run" value={String(analyses.length)} />
            </div>

            {!isPro && (
              <div className="rounded-2xl p-6" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Upgrade to Pro</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Unlimited analyses, priority processing, and all premium features.</p>
                  </div>
                  <a href="mailto:support@craftfolio.co?subject=Pro Upgrade"
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                    Contact Us
                  </a>
                </div>
              </div>
            )}

            <div>
              <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
              {analyses.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2">
                  {analyses.slice(0, 5).map(a => <AnalysisRow key={a.id} analysis={a} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {tab === "history" && (
          <div>
            <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>All Analyses</h2>
            {analyses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {analyses.map(a => <AnalysisRow key={a.id} analysis={a} />)}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <ProfileTab user={user} isPro={isPro} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-2xl font-black" style={{ color: accent ? "var(--accent-light)" : "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function AnalysisRow({ analysis }: { analysis: Analysis }) {
  const label = TYPE_LABELS[analysis.type] ?? analysis.type;
  const date = new Date(analysis.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <Link href={`/analyses/${analysis.id}`}
      className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{analysis.title ?? label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label} · {date}</p>
      </div>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
      </svg>
    </Link>
  );
}

function ProfileTab({ user, isPro, onLogout }: { user: User; isPro: boolean; onLogout: () => void }) {
  const [billingLoading, setBillingLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  async function openPortal() {
    setBillingLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else setBillingLoading(false);
  }

  async function upgradeToPro() {
    setUpgradeLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pro" }),
    });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
    else setUpgradeLoading(false);
  }

  async function buyCredit() {
    setBuyLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "credit" }),
    });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
    else setBuyLoading(false);
  }

  return (
    <div className="space-y-4 max-w-md">
      {/* Account info */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Account</h2>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Email</p>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Plan</p>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={isPro
              ? { background: "rgba(124,58,237,0.20)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.30)" }
              : { background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {isPro ? "Pro — Unlimited" : "Free"}
          </span>
        </div>
        {!isPro && (
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Credits</p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{user.credits} remaining</p>
          </div>
        )}
      </div>

      {/* Subscription management */}
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Subscription</h2>

        {isPro ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ color: "#a78bfa", flexShrink: 0 }}><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pro — $5/month</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Unlimited analyses · {user.subscriptionStatus === "active" ? "Active" : user.subscriptionStatus ?? "Active"}</p>
              </div>
            </div>
            <button onClick={openPortal} disabled={billingLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {billingLoading ? "Loading..." : "Manage billing / Change payment method"}
            </button>
            <button onClick={openPortal} disabled={billingLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171" }}>
              {billingLoading ? "Loading..." : "Cancel subscription"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Upgrade to Pro for unlimited analyses at $5/month, or buy individual credits for $1 each.</p>
            <button onClick={upgradeToPro} disabled={upgradeLoading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              {upgradeLoading ? "Redirecting..." : "Upgrade to Pro — $5/month"}
            </button>
            <button onClick={buyCredit} disabled={buyLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {buyLoading ? "Redirecting..." : "Buy 1 credit — $1.00"}
            </button>
          </>
        )}
      </div>

      <button onClick={onLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        Sign Out
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No analyses yet</p>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Upload your resume to get started.</p>
      <Link href="/resume-help"
        className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
        Analyze Resume
      </Link>
    </div>
  );
}
