import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResumeScorerClient from "./ResumeScorerClient";
import { getSession } from "@/lib/auth";

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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ResumeScorerClient isLoggedIn={true} />
      </div>
    </div>
  );
}
