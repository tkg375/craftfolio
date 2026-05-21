import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResumeScorerClient from "./ResumeScorerClient";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume Help — Craftfolio",
  description: "Score, rewrite, and tailor your resume with AI.",
};

export default async function ResumeHelpPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "var(--text-primary)", lineHeight: 1.4, display: "block" }}>Craftfolio</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          ← Dashboard
        </Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-10">
        <ResumeScorerClient isLoggedIn={true} />
      </div>
    </div>
  );
}
