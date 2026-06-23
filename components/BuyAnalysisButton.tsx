"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const PaymentModal = dynamic(() => import("@/components/PaymentModal"), { ssr: false });

export default function BuyAnalysisButton({ hidePrice }: { returnUrl?: string; hidePrice?: boolean; isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <PaymentModal type="credit" onClose={() => setOpen(false)} onSuccess={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(true)}
        className="w-full font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 text-sm flex items-center justify-center gap-1.5 text-white mt-2"
        style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)", boxShadow: "0 4px 16px rgba(202,138,4,0.35)" }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        {hidePrice ? "Buy Analysis" : "Buy 1 Credit — $1.00"}
      </button>
    </>
  );
}
