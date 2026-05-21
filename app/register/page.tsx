"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return; }
    router.push("/resume-help");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-page)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <span style={{ fontFamily: "AmbarPearl", fontSize: "2.5rem", color: "var(--text-primary)", lineHeight: 1 }}>Craftfolio</span>
          </Link>
          <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Create your account</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Free to start. No credit card required.</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex flex-wrap gap-2 mb-5">
            {["3 free analyses", "No card needed"].map(f => (
              <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "var(--accent-light)", border: "1px solid rgba(124,58,237,0.25)" }}>{f}</span>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 8 characters" minLength={8} />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full font-bold py-3 rounded-xl text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--text-dim)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent-light)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
