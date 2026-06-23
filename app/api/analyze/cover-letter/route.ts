import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/gemini";
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
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    db.analysis.deleteMany({ where: { userId: session.id, createdAt: { lt: cutoff } } }).catch(() => {});
    return NextResponse.json({ error: limitResult.reason ?? "Limit reached" }, { status: 402 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = (env as unknown as Record<string, string>).OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let body: { resumeText?: string; resumePdfBase64?: string; jobDescription?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { resumeText, resumePdfBase64, jobDescription } = body;

  if (resumePdfBase64 && resumePdfBase64.length > 14_000_000)
    return NextResponse.json({ error: "PDF too large. Maximum size is 10MB." }, { status: 400 });
  if (resumeText && resumeText.length > 100_000)
    return NextResponse.json({ error: "Resume text too large. Maximum is 100,000 characters." }, { status: 400 });
  if (jobDescription && jobDescription.length > 20_000)
    return NextResponse.json({ error: "Job description too large. Maximum is 20,000 characters." }, { status: 400 });
  if (!resumeText && !resumePdfBase64)
    return NextResponse.json({ error: "Resume is required" }, { status: 400 });
  if (!jobDescription?.trim())
    return NextResponse.json({ error: "Job description is required to generate a cover letter" }, { status: 400 });

  let effectiveText = resumeText;
  if (!effectiveText && resumePdfBase64) {
    try { effectiveText = await extractTextFromPdf(resumePdfBase64); }
    catch {
      await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
      return NextResponse.json({ error: "Could not extract text from PDF. Please paste your resume as text instead." }, { status: 400 });
    }
  }

  let coverLetter: string;
  try {
    const raw = await generateCoverLetter(apiKey, jobDescription, effectiveText);
    coverLetter = raw.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  } catch (err) {
    try { await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } }); }
    catch (refundErr) { console.error("Credit refund failed:", refundErr); }
    console.error("Cover letter error:", err);
    return NextResponse.json({ error: "Cover letter generation failed. Please try again." }, { status: 500 });
  }

  await db.analysis.create({
    data: {
      userId: session.id,
      type: "cover_letter",
      result: JSON.stringify({ coverLetter }),
    },
  });

  return NextResponse.json({ coverLetter });
}
