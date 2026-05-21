import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rewriteResume } from "@/lib/gemini";
import type { ResumeAnalysis } from "@/lib/gemini";
import { checkAndDecrementCredits } from "@/lib/checkLimit";
import { getTemplatePromptAddendum } from "@/lib/resume-templates";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getSession();

  const limitResult = await checkAndDecrementCredits(session?.id ?? "");
  if (!limitResult.allowed) {
    return NextResponse.json({ error: limitResult.reason ?? "Limit reached" }, { status: 402 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let body: { originalResume?: string; resumePdfBase64?: string; analysis?: ResumeAnalysis; jobDescription?: string; templateId?: string; targetProfession?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { originalResume, resumePdfBase64, analysis, jobDescription, templateId, targetProfession } = body;

  if (targetProfession && targetProfession.length > 200)
    return NextResponse.json({ error: "Target profession too long." }, { status: 400 });
  if (resumePdfBase64 && resumePdfBase64.length > 14_000_000)
    return NextResponse.json({ error: "PDF too large. Maximum size is 10MB." }, { status: 400 });
  if (originalResume && originalResume.length > 100_000)
    return NextResponse.json({ error: "Resume text too large. Maximum is 100,000 characters." }, { status: 400 });
  if (jobDescription && jobDescription.length > 20_000)
    return NextResponse.json({ error: "Job description too large. Maximum is 20,000 characters." }, { status: 400 });
  if ((!originalResume && !resumePdfBase64) || !analysis)
    return NextResponse.json({ error: "Missing resume or analysis" }, { status: 400 });

  const sanitizedAnalysis: ResumeAnalysis = {
    ...analysis,
    missingKeywords: (analysis.missingKeywords ?? []).map(k => String(k).slice(0, 100)),
    weaknesses: (analysis.weaknesses ?? []).map(w => ({
      point: String(w?.point ?? "").slice(0, 200),
      explanation: String(w?.explanation ?? "").slice(0, 500),
    })),
    suggestions: (analysis.suggestions ?? []).map(s => ({
      action: String(s?.action ?? "").slice(0, 200),
      priority: (["low", "medium", "high"] as const).includes(s?.priority as "low" | "medium" | "high") ? s.priority as "low" | "medium" | "high" : "medium" as const,
      explanation: String(s?.explanation ?? "").slice(0, 500),
    })),
  };

  const templateAddendum = templateId ? getTemplatePromptAddendum(templateId) : undefined;

  let rewritten: string;
  try {
    const raw = await rewriteResume(apiKey, sanitizedAnalysis, jobDescription, originalResume, resumePdfBase64, templateAddendum, targetProfession);
    rewritten = raw.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  } catch (err) {
    if (session?.id) {
      await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
    }
    console.error("Rewrite error:", err);
    return NextResponse.json({ error: "Rewrite failed. Please try again." }, { status: 500 });
  }

  if (session?.id) {
    await db.analysis.create({
      data: {
        userId: session.id,
        type: "resume_rewrite",
        result: { rewritten: rewritten.slice(0, 50_000) },
      },
    });
  }

  return NextResponse.json({ rewritten });
}
