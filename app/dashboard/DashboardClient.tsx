"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const PaymentModal = dynamic(() => import("@/components/PaymentModal"), { ssr: false });

type Analysis = { id: string; type: string; title: string | null; createdAt: string };
type User = { id: string; email: string; plan: string; credits: number; subscriptionStatus?: string | null };

const TYPE_LABELS: Record<string, string> = {
  resume: "ATS Analysis",
  resume_job: "Job Match Analysis",
  resume_rewrite: "Full Rewrite",
  "resume-rewrite": "Full Rewrite",
  career_pivot: "Career Pivot",
  "cover-letter": "Cover Letter",
  cover_letter: "Cover Letter",
};

export default function DashboardClient({ user, analyses }: { user: User; analyses: Analysis[] }) {
  const [tab, setTab] = useState<"overview" | "profile">("overview");
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
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" className="flex items-center shrink-0" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "clamp(1.4rem, 5vw, 2rem)", color: "#a78bfa", lineHeight: 1.4, display: "block", paddingTop: "4px" }}>Craftfolio</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/resume-help"
            className="font-bold px-3 sm:px-4 py-2 rounded-full text-white text-xs sm:text-sm whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>
            <span className="hidden sm:inline">Analyze Resume</span>
            <span className="sm:hidden">Analyze</span>
          </Link>
          <button onClick={handleLogout}
            className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <span className="hidden sm:inline">Sign Out</span>
            <svg className="sm:hidden" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
          {(["overview", "profile"] as const).map(t => (
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
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Unlimited analyses, priority processing, and all premium features — $5/month.</p>
                  </div>
                  <button
                    onClick={() => setTab("profile")}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl text-white whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                    Upgrade — $5/mo
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>24h</span>
                </div>
                <Link href="/dashboard/history" className="flex items-center gap-1 text-xs font-semibold transition-all hover:opacity-70" style={{ color: "var(--accent-light)" }}>
                  View all
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                </Link>
              </div>
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
  const [payModal, setPayModal] = useState<"credit" | "pro" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError(null);
    const res = await fetch("/api/auth/account", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json() as { error?: string };
      setDeleteError(data.error ?? "Something went wrong. Please try again.");
      setDeleteLoading(false);
    }
  }

  async function openPortal() {
    setBillingLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else setBillingLoading(false);
  }

  return (
    <div className="space-y-4">
      {payModal && (
        <PaymentModal
          type={payModal}
          onClose={() => setPayModal(null)}
          onSuccess={() => setPayModal(null)}
        />
      )}
      {/* Account info */}
      <div className="grid sm:grid-cols-2 gap-4 items-start">
        {/* Account info */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Account</h2>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Email</p>
            <p className="text-sm break-all" style={{ color: "var(--text-primary)" }}>{user.email}</p>
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
            <button onClick={() => setPayModal("pro")}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              Upgrade to Pro — $5/month
            </button>
            <button onClick={() => setPayModal("credit")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Buy 1 credit — $1.00
            </button>
          </>
        )}
        </div>
      </div>{/* end grid */}

      <button onClick={onLogout}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        Sign Out
      </button>

      {/* Danger zone */}
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.18)" }}>
        <h2 className="font-bold text-sm" style={{ color: "#f87171" }}>Danger Zone</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        {deleteError && (
          <p className="text-xs font-semibold" style={{ color: "#f87171" }}>{deleteError}</p>
        )}
        {!deleteConfirm ? (
          <button onClick={() => setDeleteConfirm(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.30)", color: "#f87171" }}>
            Delete Account
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: "#fca5a5" }}>Are you sure? All your analyses and data will be wiped permanently.</p>
            <div className="flex gap-2">
              <button onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: "rgba(239,68,68,0.80)", color: "#fff" }}>
                {deleteLoading ? "Deleting..." : "Yes, delete everything"}
              </button>
            </div>
          </div>
        )}
      </div>
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
