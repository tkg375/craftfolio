import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/gemini";
import { checkAndDecrementCredits } from "@/lib/checkLimit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();

  const limitResult = await checkAndDecrementCredits(session?.id ?? "");
  if (!limitResult.allowed) {
    return NextResponse.json({ error: limitResult.reason ?? "Limit reached" }, { status: 402 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
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

  let coverLetter: string;
  try {
    const raw = await generateCoverLetter(apiKey, jobDescription, resumeText, resumePdfBase64);
    coverLetter = raw.replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  } catch (err) {
    if (session?.id) {
      await db.user.update({ where: { id: session.id }, data: { credits: { increment: 1 } } });
    }
    console.error("Cover letter error:", err);
    return NextResponse.json({ error: "Cover letter generation failed. Please try again." }, { status: 500 });
  }

  if (session?.id) {
    await db.analysis.create({
      data: {
        userId: session.id,
        type: "cover_letter",
        result: { coverLetter },
      },
    });
  }

  return NextResponse.json({ coverLetter });
}
