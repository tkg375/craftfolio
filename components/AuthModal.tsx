"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthModalContextType = {
  openModal: (mode?: "login" | "register", redirectTo?: string) => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const router = useRouter();

  const openModal = useCallback((m: "login" | "register" = "register", redirect = "/dashboard") => {
    setMode(m);
    setRedirectTo(redirect);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setLoginError(data.error ?? "Something went wrong."); return; }
      closeModal();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setRegError(data.error ?? "Something went wrong."); return; }
      closeModal();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setRegError("Something went wrong. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative w-full max-w-md rounded-2xl p-8" style={{ background: 'var(--bg-primary)', border: "1px solid var(--border-subtle)", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }}>
            {/* Close */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-900 hover:text-slate-600 transition">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Tab toggle */}
            <div className="flex rounded-xl p-1 mb-6 mt-2" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              {(["register", "login"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m ? "text-white" : "text-slate-600 hover:text-slate-900"}`}
                  style={mode === m ? { background: "linear-gradient(135deg, #B91C1C, #DC2626)" } : {}}
                >
                  {m === "register" ? "Sign Up" : "Sign In"}
                </button>
              ))}
            </div>

            {mode === "register" ? (
              <>
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
                  <p className="text-slate-600 mt-1 text-sm">Free forever. No credit card required.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                  {["3 free credits", "All tools included", "No card required"].map(f => (
                    <div key={f} className="rounded-lg px-3 py-1.5" style={{ background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.20)" }}>
                      <p className="text-xs font-medium text-red-400">{f}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="you@example.com"
                      className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="At least 8 characters" minLength={8}
                      className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }} />
                  </div>
                  {regError && <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: '#f87171' }}>{regError}</div>}
                  <button type="submit" disabled={regLoading}
                    className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)", boxShadow: "0 0 16px rgba(232,100,124,0.30)" }}>
                    {regLoading ? "Creating account..." : "Create Free Account"}
                  </button>
                </form>
                <p className="text-center text-xs text-slate-700 mt-4">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="underline text-slate-600 hover:text-slate-900" onClick={closeModal}>Terms</Link> and{" "}
                  <Link href="/privacy" className="underline text-slate-600 hover:text-slate-900" onClick={closeModal}>Privacy Policy</Link>.
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
                  <p className="text-slate-600 mt-1 text-sm">Sign in to your Craftfolio account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="you@example.com"
                      className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••"
                      className="w-full rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }} />
                  </div>
                  {loginError && <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: '#f87171' }}>{loginError}</div>}
                  <button type="submit" disabled={loginLoading}
                    className="w-full text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #E8647C, #DC2626)", boxShadow: "0 0 16px rgba(232,100,124,0.30)" }}>
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
