import { extractText } from "unpdf";

export async function extractTextFromPdf(base64: string): Promise<string> {
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const { text } = await extractText(binary, { mergePages: true });
  const result = Array.isArray(text) ? text.join("\n") : String(text ?? "");
  if (!result.trim()) throw new Error("No text found in PDF");
  return result.trim();
}
