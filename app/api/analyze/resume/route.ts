import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { scoreResume } from "@/lib/gemini";
import { checkAndDecrementCredits } from "@/lib/checkLimit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getSession();

  const limitResult = await checkAndDecrementCredits(session?.id ?? "");
  if (!limitResult.allowed) {
    return NextResponse.json({ error: limitResult.reason ?? "Limit reached" }, { status: 402 });
  }

  let body: { resumeText?: string; jobDescription?: string; resumePdfBase64?: string };
  try { body = await req.json() as { resumeText?: string; jobDescription?: string; resumePdfBase64?: string }; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { resumeText, jobDescription, resumePdfBase64 } = body;

  if (resumePdfBase64 && resumePdfBase64.length > 14_000_000)
    return NextResponse.json({ error: "PDF too large. Maximum size is 10MB." }, { status: 400 });
  if (resumeText && resumeText.length > 100_000)
    return NextResponse.json({ error: "Resume text too large. Maximum is 100,000 characters." }, { status: 400 });
  if (jobDescription && jobDescription.length > 20_000)
    return NextResponse.json({ error: "Job description too large. Maximum is 20,000 characters." }, { status: 400 });
  if (!resumeText && !resumePdfBase64)
    return NextResponse.json({ error: "No resume content provided" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let analysis;
  try {
    analysis = await scoreResume(apiKey, resumeText, jobDescription, resumePdfBase64);
  } catch (err) {
    if (session?.id) {
      await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
    }
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }

  if (session?.id) {
    await db.analysis.create({
      data: {
        userId: session.id,
        type: "resume",
        result: analysis as object,
      },
    });
  }

  return NextResponse.json({ analysis });
}
