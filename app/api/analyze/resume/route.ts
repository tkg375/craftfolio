import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { scoreResume } from "@/lib/gemini";
import { checkAndDecrementCredits } from "@/lib/checkLimit";
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

  let body: { resumeText?: string; jobDescription?: string; resumePdfBase64?: string; mode?: string };
  try { body = await req.json() as { resumeText?: string; jobDescription?: string; resumePdfBase64?: string; mode?: string }; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { resumeText, jobDescription, resumePdfBase64, mode } = body;

  if (resumePdfBase64 && resumePdfBase64.length > 14_000_000)
    return NextResponse.json({ error: "PDF too large. Maximum size is 10MB." }, { status: 400 });
  if (resumeText && resumeText.length > 100_000)
    return NextResponse.json({ error: "Resume text too large. Maximum is 100,000 characters." }, { status: 400 });
  if (jobDescription && jobDescription.length > 20_000)
    return NextResponse.json({ error: "Job description too large. Maximum is 20,000 characters." }, { status: 400 });
  if (!resumeText && !resumePdfBase64)
    return NextResponse.json({ error: "No resume content provided" }, { status: 400 });

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = (env as unknown as Record<string, string>).OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let effectiveText = resumeText;
  if (!effectiveText && resumePdfBase64) {
    try {
      effectiveText = await extractTextFromPdf(resumePdfBase64);
    } catch {
      return NextResponse.json({ error: "Could not extract text from PDF. Please paste your resume as text instead." }, { status: 400 });
    }
  }

  let analysis;
  try {
    analysis = await scoreResume(apiKey, effectiveText, jobDescription);
  } catch (err) {
    try { await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } }); }
    catch (refundErr) { console.error("Credit refund failed:", refundErr); }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gemini error:", msg);
    return NextResponse.json({ error: `Analysis failed: ${msg}` }, { status: 500 });
  }

  try {
    await db.analysis.create({
      data: {
        userId: session.id,
        type: mode === "job" ? "resume_job" : "resume",
        result: JSON.stringify(analysis),
      },
    });
  } catch (err) {
    console.error("Failed to save analysis:", err);
  }

  return NextResponse.json({ analysis });
}
