"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-page)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <span style={{ fontFamily: "AmbarPearl", fontSize: "2.5rem", color: "#a78bfa", lineHeight: 1 }}>Craftfolio</span>
          </Link>
          <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Reset your password</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-slate-100 font-semibold mb-1">Check your email</p>
            <p className="text-sm text-slate-400">We sent a reset link to <span className="text-slate-200">{email}</span>. It expires in 1 hour.</p>
            <Link href="/login" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-500"
                style={{ background: "var(--border-subtle)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-slate-400">
              <Link href="/login" className="text-violet-400 hover:text-violet-300">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
