import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { extractEmploymentDates } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/pdfExtract";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = (env as unknown as Record<string, string>).OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  let body: { resumeText?: string; resumePdfBase64?: string };
  try { body = await req.json() as typeof body; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { resumeText, resumePdfBase64 } = body;

  if (!resumeText && !resumePdfBase64)
    return NextResponse.json({ error: "Missing resume" }, { status: 400 });
  if (resumePdfBase64 && resumePdfBase64.length > 14_000_000)
    return NextResponse.json({ error: "PDF too large" }, { status: 400 });

  let effectiveText = resumeText;
  if (!effectiveText && resumePdfBase64) {
    try { effectiveText = await extractTextFromPdf(resumePdfBase64); }
    catch { return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 }); }
  }

  try {
    const entries = await extractEmploymentDates(apiKey, effectiveText);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("Date extraction error:", err);
    return NextResponse.json({ error: "Failed to extract dates" }, { status: 500 });
  }
}
