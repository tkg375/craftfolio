import type { Metadata } from "next";
import ResumeScorerClient from "./ResumeScorerClient";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Resume Help — Craftfolio",
  description: "Score, rewrite, and tailor your resume with AI. ATS checker, cover letter generator, and career pivot — all in one place.",
};

export default async function ResumeHelpPage() {
  const session = await getSession();
  return <ResumeScorerClient isLoggedIn={!!session} />;
}
