import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rewriteResume } from "@/lib/gemini";
import type { ResumeAnalysis, EmploymentEntry } from "@/lib/gemini";
import { checkAndDecrementCredits } from "@/lib/checkLimit";
import { getTemplatePromptAddendum } from "@/lib/resume-templates";
import { getDb } from "@/lib/db";
import { extractTextFromPdf } from "@/lib/pdfExtract";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limitResult = await checkAndDecrementCredits(session.id, db);
  if (!limitResult.allowed) {
    return NextResponse.json({ error: limitResult.reason ?? "Limit reached" }, { status: 402 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = (env as unknown as Record<string, string>).OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let body: { originalResume?: string; resumePdfBase64?: string; analysis?: ResumeAnalysis; jobDescription?: string; templateId?: string; targetProfession?: string; titleSubstitutions?: { from: string; to: string }[]; correctedDates?: EmploymentEntry[] };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { originalResume, resumePdfBase64, analysis, jobDescription, templateId, targetProfession, titleSubstitutions, correctedDates } = body;

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

  let effectiveResume = originalResume;
  if (!effectiveResume && resumePdfBase64) {
    try {
      effectiveResume = await extractTextFromPdf(resumePdfBase64);
    } catch {
      await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
      return NextResponse.json({ error: "Could not extract text from PDF. Please paste your resume as text instead." }, { status: 400 });
    }
  }

  let rewritten: string;
  try {
    const sanitizedSubs = (titleSubstitutions ?? [])
      .filter(s => typeof s?.from === "string" && typeof s?.to === "string")
      .map(s => ({ from: String(s.from).slice(0, 200), to: String(s.to).slice(0, 200) }))
      .slice(0, 20);
    const sanitizedDates = (correctedDates ?? [])
      .filter(e => typeof e?.company === "string" && typeof e?.title === "string")
      .map(e => ({
        company: String(e.company).slice(0, 200),
        title: String(e.title).slice(0, 200),
        startDate: String(e.startDate ?? "").slice(0, 50),
        endDate: String(e.endDate ?? "").slice(0, 50),
      }))
      .slice(0, 30);
    const raw = await rewriteResume(apiKey, sanitizedAnalysis, jobDescription, effectiveResume, undefined, templateAddendum, targetProfession, sanitizedSubs.length ? sanitizedSubs : undefined, sanitizedDates.length ? sanitizedDates : undefined);
    rewritten = raw.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  } catch (err) {
    await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
    console.error("Rewrite error:", err);
    return NextResponse.json({ error: "Rewrite failed. Please try again." }, { status: 500 });
  }

  try {
    await db.analysis.create({
      data: {
        userId: session.id,
        type: targetProfession ? "career_pivot" : "resume_rewrite",
        result: JSON.stringify({ rewritten: rewritten.slice(0, 50_000) }),
      },
    });
  } catch (err) {
    console.error("Failed to save rewrite analysis:", err);
  }

  return NextResponse.json({ rewritten });
}
