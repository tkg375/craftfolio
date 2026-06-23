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

type SupportMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminClient() {
  const [tab, setTab] = useState<"users" | "support">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [addCreditsMap, setAddCreditsMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json() as { users?: User[] };
    setUsers(data.users ?? []);
  }, []);

  const loadMessages = useCallback(async () => {
    const res = await fetch("/api/admin/support");
    const data = await res.json() as { messages?: SupportMessage[] };
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    Promise.all([loadUsers(), loadMessages()]).then(() => setLoading(false));
  }, [loadUsers, loadMessages]);

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

  async function markRead(id: string) {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    });
    setMessages(m => m.map(x => x.id === id ? { ...x, read: true } : x));
  }

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10" style={{ background: "var(--bg-page)" }}>
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)", boxShadow: "0 4px 20px rgba(202,138,4,0.4)" }}>
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>Admin</h1>
            <p style={{ color: "var(--text-muted)" }}>{users.length} users total</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            ← Dashboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <button onClick={() => setTab("users")}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === "users" ? { background: "linear-gradient(135deg, #ca8a04, #fde047)", color: "#fff" } : { color: "var(--text-muted)" }}>
            Users
          </button>
          <button onClick={() => setTab("support")}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            style={tab === "support" ? { background: "linear-gradient(135deg, #ca8a04, #fde047)", color: "#fff" } : { color: "var(--text-muted)" }}>
            Support
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: tab === "support" ? "rgba(255,255,255,0.25)" : "#ca8a04", color: "#fff", minWidth: 20, textAlign: "center" }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : tab === "users" ? (
          <>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="mb-6"
              style={{ maxWidth: 360 }}
            />
            <div className="space-y-3">
              {filtered.map(user => (
                <div key={user.id} className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{user.email}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Joined {new Date(user.createdAt).toLocaleDateString()} · {user.plan === "pro" ? "Unlimited credits" : `${user.credits} credits`}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                      background: user.plan === "pro" ? "rgba(202,138,4,0.20)" : "rgba(255,255,255,0.07)",
                      color: user.plan === "pro" ? "var(--accent-light)" : "var(--text-muted)",
                      border: `1px solid ${user.plan === "pro" ? "rgba(202,138,4,0.35)" : "var(--border)"}`,
                    }}>
                      {user.plan.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {user.plan === "free" ? (
                      <button onClick={() => setPlan(user.id, "pro")} disabled={saving === user.id}
                        className="text-sm font-bold px-3 py-2 rounded-xl text-white disabled:opacity-50 transition-all hover:opacity-90 whitespace-nowrap"
                        style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)" }}>
                        Upgrade to Pro
                      </button>
                    ) : (
                      <button onClick={() => setPlan(user.id, "free")} disabled={saving === user.id}
                        className="text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
                        style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                        Downgrade to Free
                      </button>
                    )}
                    <button onClick={() => setCredits(user.id, 0)} disabled={saving === user.id}
                      className="text-sm font-semibold px-3 py-2 rounded-xl disabled:opacity-50 transition-all whitespace-nowrap"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      Reset Credits
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
                        <button
                          onClick={() => setAddCreditsMap(m => ({ ...m, [user.id]: String(Math.max(1, parseInt(m[user.id] || "1") - 1)) }))}
                          className="px-2 py-2 text-sm font-bold transition-all hover:opacity-70"
                          style={{ color: "var(--text-muted)" }}>−</button>
                        <input
                          type="number" min="1" placeholder="0"
                          value={addCreditsMap[user.id] ?? ""}
                          onChange={e => setAddCreditsMap(m => ({ ...m, [user.id]: e.target.value }))}
                          className="text-sm text-center"
                          style={{ width: 48, padding: "0.4rem 0", border: "none", background: "transparent", MozAppearance: "textfield" } as React.CSSProperties} />
                        <button
                          onClick={() => setAddCreditsMap(m => ({ ...m, [user.id]: String(parseInt(m[user.id] || "0") + 1) }))}
                          className="px-2 py-2 text-sm font-bold transition-all hover:opacity-70"
                          style={{ color: "var(--text-muted)" }}>+</button>
                      </div>
                      <button onClick={() => giveCredits(user.id)} disabled={saving === user.id || !addCreditsMap[user.id]}
                        className="text-sm font-bold px-3 py-2 rounded-xl text-white disabled:opacity-50 transition-all whitespace-nowrap"
                        style={{ background: "#16a34a" }}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: "var(--text-muted)" }}>No users found.</p>}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 && <p style={{ color: "var(--text-muted)" }}>No support messages yet.</p>}
            {messages.map(msg => (
              <div key={msg.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: `1px solid ${msg.read ? "var(--border)" : "rgba(202,138,4,0.4)"}` }}>
                <button className="w-full text-left px-5 py-4 flex items-start gap-3" onClick={() => {
                  setExpanded(expanded === msg.id ? null : msg.id);
                  if (!msg.read) markRead(msg.id);
                }}>
                  {!msg.read && <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: "#fde047" }} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{msg.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{msg.email}</p>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                    {expanded !== msg.id && (
                      <p className="text-sm mt-1 truncate" style={{ color: "var(--text-primary)" }}>{msg.message}</p>
                    )}
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0, transform: expanded === msg.id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
                {expanded === msg.id && (
                  <div className="px-5 pb-5">
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{msg.message}</p>
                    <a href={`mailto:${msg.email}`}
                      className="inline-block mt-4 text-xs font-semibold px-4 py-2 rounded-xl"
                      style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)", color: "#fff" }}>
                      Reply to {msg.email}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
