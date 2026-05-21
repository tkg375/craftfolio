"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  plan: string;
  credits: number;
  createdAt: string;
  subscriptionStatus: string | null;
};

export default function AdminClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [addCreditsMap, setAddCreditsMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json() as { users?: User[] };
    setUsers(data.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function setPlan(id: string, plan: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x));
      showToast(`Plan updated to ${plan}`);
    }
    setSaving(null);
  }

  async function giveCredits(id: string) {
    const n = parseInt(addCreditsMap[id] ?? "0");
    if (!n || isNaN(n)) return;
    setSaving(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addCredits: n }),
    });
    if (res.ok) {
      setUsers(u => u.map(x => x.id === id ? { ...x, credits: x.credits + n } : x));
      setAddCreditsMap(m => ({ ...m, [id]: "" }));
      showToast(`+${n} credits added`);
    }
    setSaving(null);
  }

  async function setCredits(id: string, credits: number) {
    setSaving(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credits }),
    });
    if (res.ok) {
      setUsers(u => u.map(x => x.id === id ? { ...x, credits } : x));
      showToast(`Credits set to ${credits}`);
    }
    setSaving(null);
  }

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "var(--bg-page)" }}>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Admin</h1>
            <p style={{ color: "var(--text-muted)" }}>{users.length} users total</p>
          </div>
          <Link href="/" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            ← Home
          </Link>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="mb-6"
          style={{ maxWidth: 360 }}
        />

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(user => (
              <div key={user.id} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-wrap items-start gap-4">
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{user.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Joined {new Date(user.createdAt).toLocaleDateString()} · {user.plan === "pro" ? "Unlimited credits" : `${user.credits} credits`}
                    </p>
                  </div>

                  {/* Plan badge */}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                    background: user.plan === "pro" ? "rgba(124,58,237,0.20)" : "rgba(255,255,255,0.07)",
                    color: user.plan === "pro" ? "var(--accent-light)" : "var(--text-muted)",
                    border: `1px solid ${user.plan === "pro" ? "rgba(124,58,237,0.35)" : "var(--border)"}`,
                  }}>
                    {user.plan.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {/* Toggle plan */}
                  {user.plan === "free" ? (
                    <button
                      onClick={() => setPlan(user.id, "pro")}
                      disabled={saving === user.id}
                      className="text-sm font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50 transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                      Upgrade to Pro
                    </button>
                  ) : (
                    <button
                      onClick={() => setPlan(user.id, "free")}
                      disabled={saving === user.id}
                      className="text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      Downgrade to Free
                    </button>
                  )}

                  {/* Set credits to 0 */}
                  <button
                    onClick={() => setCredits(user.id, 0)}
                    disabled={saving === user.id}
                    className="text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
                    style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    Reset Credits
                  </button>

                  {/* Add credits */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="# credits"
                      value={addCreditsMap[user.id] ?? ""}
                      onChange={e => setAddCreditsMap(m => ({ ...m, [user.id]: e.target.value }))}
                      className="text-sm"
                      style={{ width: 100, padding: "0.5rem 0.75rem" }}
                    />
                    <button
                      onClick={() => giveCredits(user.id)}
                      disabled={saving === user.id || !addCreditsMap[user.id]}
                      className="text-sm font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50 transition-all"
                      style={{ background: "#16a34a" }}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ color: "var(--text-muted)" }}>No users found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
