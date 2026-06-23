import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const BODY_KEYWORDS = ["responsibilities", "qualifications", "requirements", "you will", "you'll", "we are looking", "what you'll", "what you will", "about the role", "about this role", "job description", "we're looking"];

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

function looksLikeJobContent(text: string): boolean {
  if (text.length < 400) return false;
  const lower = text.toLowerCase();
  return BODY_KEYWORDS.some((k) => lower.includes(k));
}

function isPublicUrl(raw: string): boolean {
  try {
    const { protocol, hostname } = new URL(raw);
    if (protocol !== "http:" && protocol !== "https:") return false;
    if (/^(localhost|127\.|0\.0\.0\.0|::1$|fc00:|fe80:|169\.254\.)/.test(hostname)) return false;
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/gi, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  ).slice(0, 8000);
}

// ── Platform-specific handlers ─────────────────────────────────────────────

type LdJsonJobPosting = {
  "@type"?: string;
  title?: string;
  description?: string;
  hiringOrganization?: { name?: string };
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } };
};

function extractLdJsonJobPosting(html: string): string | null {
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html)) !== null) {
    try {
      // eslint-disable-next-line no-control-regex
      const raw = JSON.parse(match[1].replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, " "));
      const candidates: LdJsonJobPosting[] = Array.isArray(raw) ? raw : (raw["@graph"] ?? [raw]);
      for (const item of candidates) {
        if (item["@type"] !== "JobPosting") continue;
        const description = decodeHtmlEntities((item.description ?? "").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim());
        if (!description) continue;
        const location = [item.jobLocation?.address?.addressLocality, item.jobLocation?.address?.addressRegion].filter(Boolean).join(", ");
        return `${item.title ?? ""}\n${item.hiringOrganization?.name ?? ""}${location ? " — " + location : ""}\n\n${description}`.slice(0, 8000);
      }
    } catch { /* not valid JSON */ }
  }
  return null;
}

async function fetchWorkday(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const html = await res.text();
    return extractLdJsonJobPosting(html);
  } catch { return null; }
}

async function fetchGreenhouse(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    let company = "", jobId = "";
    if (parsed.hostname === "boards.greenhouse.io") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      company = parts[0] ?? ""; jobId = parts[2] ?? "";
    } else if (parsed.hostname.endsWith(".greenhouse.io")) {
      company = parsed.hostname.replace(".greenhouse.io", "");
      const parts = parsed.pathname.split("/").filter(Boolean);
      jobId = parts[parts.length - 1] ?? "";
    }
    if (!company || !jobId) return null;
    const apiRes = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company}/jobs/${jobId}?content=true`, { signal: AbortSignal.timeout(8000) });
    if (!apiRes.ok) return null;
    const data = await apiRes.json() as { title?: string; location?: { name?: string }; content?: string; departments?: { name?: string }[] };
    const description = decodeHtmlEntities((data.content ?? "").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim());
    if (!description) return null;
    return `${data.title ?? ""}\n${[data.location?.name, data.departments?.[0]?.name].filter(Boolean).join(" · ")}\n\n${description}`.slice(0, 8000);
  } catch { return null; }
}

async function fetchLever(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "jobs.lever.co") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const company = parts[0] ?? "", jobId = parts[1] ?? "";
    if (!company || !jobId) return null;
    const apiRes = await fetch(`https://api.lever.co/v0/postings/${company}/${jobId}`, { signal: AbortSignal.timeout(8000) });
    if (!apiRes.ok) return null;
    const data = await apiRes.json() as { text?: string; descriptionPlain?: string; description?: string; lists?: { text?: string; content?: string }[]; additional?: string; categories?: { location?: string; team?: string } };
    const body = decodeHtmlEntities((data.descriptionPlain || (data.description ?? "").replace(/<[^>]*>/g, " ")).replace(/\s{2,}/g, " ").trim());
    const lists = (data.lists ?? []).map(l => `${l.text ?? ""}\n${decodeHtmlEntities((l.content ?? "").replace(/<[^>]*>/g, " "))}`).join("\n\n");
    const full = [data.text, [data.categories?.location, data.categories?.team].filter(Boolean).join(" · "), body, lists, data.additional].filter(Boolean).join("\n\n");
    if (!full || full.length < 200) return null;
    return full.slice(0, 8000);
  } catch { return null; }
}

async function fetchAshby(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "jobs.ashbyhq.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const org = parts[0] ?? "", jobId = parts[1] ?? "";
    if (!org || !jobId) return null;
    const apiRes = await fetch("https://jobs.ashbyhq.com/api/non-user-graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "ApiJobPosting",
        variables: { organizationHostedJobsPageName: org, jobPostingId: jobId },
        query: `query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) { jobPosting(organizationHostedJobsPageName: $organizationHostedJobsPageName, jobPostingId: $jobPostingId) { title descriptionHtml locationName employmentType } }`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!apiRes.ok) return null;
    const data = await apiRes.json() as { data?: { jobPosting?: { title?: string; descriptionHtml?: string; locationName?: string; employmentType?: string } } };
    const posting = data.data?.jobPosting;
    if (!posting) return null;
    const description = decodeHtmlEntities((posting.descriptionHtml ?? "").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim());
    if (!description) return null;
    return `${posting.title ?? ""}\n${[posting.locationName, posting.employmentType].filter(Boolean).join(" · ")}\n\n${description}`.slice(0, 8000);
  } catch { return null; }
}

async function fetchSmartRecruiters(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    // Pattern: smartrecruiters.com/companyname/jobid or careers.company.com with SR embed
    let company = "", jobId = "";
    if (parsed.hostname === "jobs.smartrecruiters.com" || parsed.hostname === "www.smartrecruiters.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      company = parts[0] ?? ""; jobId = parts[1] ?? "";
    }
    if (!company || !jobId) return null;
    const apiRes = await fetch(`https://api.smartrecruiters.com/v1/companies/${company}/postings/${jobId}`, { signal: AbortSignal.timeout(8000) });
    if (!apiRes.ok) return null;
    const data = await apiRes.json() as { name?: string; department?: { label?: string }; location?: { city?: string; region?: string }; jobAd?: { sections?: { jobDescription?: { text?: string }; qualifications?: { text?: string }; additionalInformation?: { text?: string } } } };
    const sections = data.jobAd?.sections;
    const description = [
      sections?.jobDescription?.text,
      sections?.qualifications?.text,
      sections?.additionalInformation?.text,
    ].filter(Boolean).map(t => decodeHtmlEntities((t ?? "").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim())).join("\n\n");
    if (!description) return null;
    const location = [data.location?.city, data.location?.region].filter(Boolean).join(", ");
    return `${data.name ?? ""}\n${[data.department?.label, location].filter(Boolean).join(" · ")}\n\n${description}`.slice(0, 8000);
  } catch { return null; }
}

async function fetchSaaSHR(url: string): Promise<string | null> {
  // SaaSHR/iSolved portals are Angular SPAs — try to extract job ID and hit their internal API
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("saashr.com")) return null;
    // Extract client ID from hostname or path e.g. secure10.saashr.com/ta/6154256.careers
    const clientMatch = parsed.pathname.match(/\/ta\/(\d+)\.careers/);
    if (!clientMatch) return null;
    const clientId = clientMatch[1];
    // Job detail URLs have the job ID in the hash: #/jobs/detail/JOBID or in query
    const jobIdHash = parsed.hash.match(/\/jobs\/detail\/([^/?#]+)/)?.[1];
    const jobIdQuery = parsed.searchParams.get("jobId") ?? parsed.searchParams.get("jid");
    const jobId = jobIdHash ?? jobIdQuery;
    if (!jobId) {
      // No specific job — return null, let ScrapingAnt handle the careers listing page
      return null;
    }
    // Try their internal REST API pattern
    const apiUrl = `https://${parsed.hostname}/ta/${clientId}.careers/api/json/reply/JobDetails?JobId=${jobId}&lang=en-US`;
    const apiRes = await fetch(apiUrl, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(8000) });
    if (!apiRes.ok) return null;
    const data = await apiRes.json() as { JobTitle?: string; JobDescription?: string; Requirements?: string; CompanyName?: string };
    const description = decodeHtmlEntities(((data.JobDescription ?? "") + "\n\n" + (data.Requirements ?? "")).replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim());
    if (!description || description.length < 100) return null;
    return `${data.JobTitle ?? ""}\n${data.CompanyName ?? ""}\n\n${description}`.slice(0, 8000);
  } catch { return null; }
}

async function fetchIcims(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("icims.com")) return null;
    // iCIMS URLs: careers-company.icims.com/jobs/JOBID/job
    const jobIdMatch = parsed.pathname.match(/\/jobs\/(\d+)/);
    if (!jobIdMatch) return null;
    const jobId = jobIdMatch[1];
    const companySlug = parsed.hostname.split(".")[0]; // careers-company → careers-company
    const apiRes = await fetch(`https://api.icims.com/customers/${companySlug}/jobs/${jobId}`, {
      headers: { ...BROWSER_HEADERS, "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!apiRes.ok) {
      // Fall back to ld+json from page fetch
      const pageRes = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
      if (!pageRes.ok) return null;
      const html = await pageRes.text();
      return extractLdJsonJobPosting(html);
    }
    const data = await apiRes.json() as { jobtitle?: string; joblocation?: { formatted?: string }; jobad?: string };
    const description = decodeHtmlEntities((data.jobad ?? "").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim());
    if (!description) return null;
    return `${data.jobtitle ?? ""}\n${data.joblocation?.formatted ?? ""}\n\n${description}`.slice(0, 8000);
  } catch { return null; }
}

function detectPlatform(url: string): "workday" | "greenhouse" | "lever" | "ashby" | "smartrecruiters" | "saashr" | "icims" | null {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes("myworkdayjobs.com")) return "workday";
    if (hostname === "boards.greenhouse.io" || hostname.endsWith(".greenhouse.io")) return "greenhouse";
    if (hostname === "jobs.lever.co") return "lever";
    if (hostname === "jobs.ashbyhq.com") return "ashby";
    if (hostname.includes("smartrecruiters.com")) return "smartrecruiters";
    if (hostname.includes("saashr.com")) return "saashr";
    if (hostname.includes("icims.com")) return "icims";
    return null;
  } catch { return null; }
}

async function fetchWithScrapingAnt(url: string): Promise<string | null> {
  const apiKey = process.env.SCRAPINGANT_API_KEY;
  if (!apiKey) return null;
  try {
    const params = new URLSearchParams({ url, "x-api-key": apiKey, js_rendering: "true", browser: "false" });
    const res = await fetch(`https://api.scrapingant.com/v2/general?${params}`, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const html = await res.text();
    const ldText = extractLdJsonJobPosting(html);
    if (ldText) return ldText;
    // stripHtml caps at 8000 chars from the top — for ScrapingAnt, search the full text
    const fullText = decodeHtmlEntities(
      html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
    );
    if (fullText.length > 200) return fullText.slice(0, 12000);
    return null;
  } catch { return null; }
}

async function fetchWithCloudfareBrowser(url: string): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const browser_env = env as unknown as Record<string, unknown>;
    if (!browser_env.BROWSER) return null;

    const puppeteer = await import("@cloudflare/puppeteer");
    const browser = await puppeteer.default.launch(browser_env.BROWSER as Parameters<typeof puppeteer.default.launch>[0]);
    try {
      const page = await browser.newPage();
      await page.setUserAgent(BROWSER_HEADERS["User-Agent"]);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 25000 });
      const html = await page.content();
      const ldText = extractLdJsonJobPosting(html);
      if (ldText) return ldText;
      const text = await page.evaluate(() => document.body.innerText);
      if (text && text.length > 200) return text.slice(0, 12000);
      return null;
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error("Cloudflare browser error:", err);
    return null;
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 30 fetches per hour
  const now = new Date();
  const rateLimitKey = `fetch_job_url:${session.id}`;
  const rateRow = await db.rateLimit.findUnique({ where: { key: rateLimitKey } });
  if (rateRow && rateRow.resetAt > now && rateRow.attempts >= 30) {
    return NextResponse.json({ error: "Too many URL fetches. Please paste the job description instead.", needsPaste: true }, { status: 429 });
  }
  const resetAt = new Date(Date.now() + 3600 * 1000);
  if (!rateRow || rateRow.resetAt <= now) {
    await db.rateLimit.upsert({ where: { key: rateLimitKey }, create: { key: rateLimitKey, attempts: 1, resetAt }, update: { attempts: 1, resetAt } });
  } else {
    await db.rateLimit.update({ where: { key: rateLimitKey }, data: { attempts: { increment: 1 } } });
  }

  // Prune expired rate limit rows periodically (1% chance per request) to prevent unbounded growth
  if (Math.random() < 0.01) {
    db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }).catch(() => {});
  }

  let body: { url?: string };
  try { body = await req.json() as { url?: string }; }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const { url } = body;
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });
  if (!isPublicUrl(url)) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  // Step 1: platform-specific fast path
  const platform = detectPlatform(url);
  if (platform) {
    const handlers = { workday: fetchWorkday, greenhouse: fetchGreenhouse, lever: fetchLever, ashby: fetchAshby, smartrecruiters: fetchSmartRecruiters, saashr: fetchSaaSHR, icims: fetchIcims };
    const text = await handlers[platform](url);
    if (text && looksLikeJobContent(text)) return NextResponse.json({ text });
  }

  // Step 2: generic plain fetch — try ld+json first, then stripped HTML
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow", signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const html = await res.text();
      const ldText = extractLdJsonJobPosting(html);
      if (ldText && looksLikeJobContent(ldText)) return NextResponse.json({ text: ldText });
      const pageText = stripHtml(html);
      if (looksLikeJobContent(pageText)) return NextResponse.json({ text: pageText });
    }
  } catch { /* fall through */ }

  // Step 3: ScrapingAnt fallback (JS rendering + residential proxies)
  const antText = await fetchWithScrapingAnt(url);
  if (antText && looksLikeJobContent(antText)) return NextResponse.json({ text: antText });

  // Step 4: Cloudflare Browser Rendering fallback (full JS execution)
  const pageText = await fetchWithCloudfareBrowser(url);
  if (pageText && looksLikeJobContent(pageText)) return NextResponse.json({ text: pageText });

  return NextResponse.json({ error: "This job page couldn't be read automatically. Please paste the job description below.", needsPaste: true }, { status: 422 });
}
