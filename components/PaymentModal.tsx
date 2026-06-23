"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#ca8a04",
    colorBackground: "#13131f",
    colorText: "#e2e8f0",
    colorDanger: "#f87171",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "12px",
  },
};

function CheckoutForm({
  type,
  clientSecret,
  onSuccess,
  onCancel,
}: {
  type: "credit" | "pro";
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? "Payment failed"); setLoading(false); return; }

    // Use confirmPayment for payment intents, confirmSetup for setup intents
    const isSetup = clientSecret?.startsWith("seti_") || clientSecret?.includes("_secret_seti");
    const confirmFn = isSetup
      ? stripe.confirmSetup({ elements, confirmParams: { return_url: `${window.location.origin}/dashboard?paid=1` }, redirect: "if_required" })
      : stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/dashboard?paid=1` }, redirect: "if_required" });

    const { error: confirmErr } = await confirmFn;

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "accordion", wallets: { applePay: "never", googlePay: "never" }, defaultValues: undefined }} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#94a3b8" }}>
          Cancel
        </button>
        <button type="submit" disabled={!stripe || loading}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)" }}>
          {loading ? "Processing..." : type === "pro" ? "Subscribe — $5/mo" : "Pay — $1.00"}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({
  type,
  onClose,
  onSuccess,
}: {
  type: "credit" | "pro";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
      .then(async r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: { clientSecret?: string; error?: string }) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setFetchError(data.error ?? "Could not start checkout");
      })
      .catch(() => setFetchError("Network error"));
  }, [type]);

  function handleSuccess() {
    onSuccess();
    onClose();
    // Refresh the page so plan/credits update
    window.location.href = "/dashboard?paid=1";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: "#0d0d1a", border: "1px solid rgba(202,138,4,0.30)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black" style={{ color: "#f1f5f9" }}>
              {type === "pro" ? "Upgrade to Pro" : "Buy 1 Credit"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {type === "pro" ? "Unlimited analyses · $5/month · Cancel anytime" : "One resume analysis · $1.00"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {fetchError && (
          <p className="text-sm text-red-400 text-center py-4">{fetchError}</p>
        )}

        {!clientSecret && !fetchError && (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24" style={{ color: "#ca8a04" }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
            <CheckoutForm type={type} clientSecret={clientSecret} onSuccess={handleSuccess} onCancel={onClose} />
          </Elements>
        )}
      </div>
    </div>
  );
}
