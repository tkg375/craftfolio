"use client";

import { useAuthModal } from "@/components/AuthModal";

export default function BuyAnalysisButton({ returnUrl, hidePrice, isLoggedIn }: { returnUrl: string; hidePrice?: boolean; isLoggedIn?: boolean }) {
  const { openModal } = useAuthModal();

  async function handleClick() {
    if (!isLoggedIn) {
      openModal("register");
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnUrl, type: "credit" }),
    });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      className="w-full font-semibold px-4 py-2.5 rounded-full transition-opacity hover:opacity-90 text-sm flex items-center justify-center gap-1.5 text-slate-900"
      style={{ background: 'linear-gradient(135deg, #E8647C, #DC2626)', boxShadow: '0 4px 16px rgba(232,100,124,0.30)' }}
    >
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      {hidePrice ? "Buy Analysis" : "Buy Analysis — $1.00"}
    </button>
  );
}
