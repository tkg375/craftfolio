const OPENAI_MODEL = "gpt-4o";
const OPENAI_MODEL_REWRITE = "gpt-4o";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function parseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error("Failed to parse OpenAI JSON:", raw.slice(0, 500));
    throw new Error("Invalid response from AI. Please try again.");
  }
}

async function callOpenAI(apiKey: string, prompt: string, jsonMode = true, model = OPENAI_MODEL, maxTokens = 4096): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
  };
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`OpenAI ${res.status}:`, err);
    throw new Error(`OpenAI API error ${res.status}`);
  }

  const json = await res.json() as { choices?: { message: { content: string } }[] };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    console.error("OpenAI empty response:", JSON.stringify(json));
    throw new Error("Empty response from AI");
  }
  return text;
}

export async function scoreResume(
  apiKey: string,
  resumeText?: string,
  jobDescription?: string,
  _resumePdfBase64?: string
): Promise<ResumeAnalysis> {
  if (!resumeText) throw new Error("Resume text is required.");

  const jobContext = jobDescription
    ? `\n\nJob Description:\n${jobDescription}`
    : "\n\nNo job description provided — evaluate against general best practices.";

  const prompt = `You are an expert resume coach, ATS optimization specialist, and certified professional resume writer (CPRW). Analyze this resume and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "overallScore": 0-100,
  "atsScore": 0-100,
  "keywordMatch": 0-100,
  "impactScore": 0-100,
  "foundKeywords": ["short keyword or phrase, max 5 words each"],
  "missingKeywords": ["short keyword or phrase, max 5 words each — NEVER a sentence or paragraph"],
  "strengths": [{"point": "string", "explanation": "string"}],
  "weaknesses": [{"point": "string", "explanation": "string"}],
  "suggestions": [{"action": "string", "priority": "low|medium|high", "explanation": "string"}],
  "summary": "2-3 sentence overall assessment — write this as an honest, specific take a real career coach would give, not a generic template. Name the candidate's actual strengths and the most important thing holding them back.",
  "careerOptions": [
    {
      "title": "Job title",
      "fit": "strong|good|stretch",
      "why": "1-2 sentences: which specific skills/experience from this resume make them a fit for this role",
      "keywordsToAdd": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "jobTitleRecommendations": [
    {
      "current": "Exact job title as it appears on the resume",
      "recommended": ["Alternative title 1", "Alternative title 2", "Alternative title 3"],
      "reason": "1-2 sentences: why the alternative titles get more recruiter searches and ATS hits"
    }
  ]
}

jobTitleRecommendations: For EVERY job title that appears on this resume, suggest 2-4 alternative wordings that are more searchable, more ATS-friendly, and better reflect modern industry terminology. Focus on titles that will appear more often in recruiter searches and job postings. The "current" field must match the exact title from the resume. Do NOT suggest titles that change the candidate's seniority level or imply experience they don't have — reword, don't upgrade. Examples: "Office Manager" → ["Operations Manager", "Administrative Manager", "Business Operations Manager"]; "Social Media Coordinator" → ["Social Media Manager", "Digital Marketing Coordinator", "Content Marketing Specialist"].

careerOptions: Based STRICTLY on the actual industries, job titles, skills, and experience listed in this resume, suggest 6-8 realistic career paths. ONLY suggest roles that are directly related to what this person has actually done — do NOT suggest industries, fields, or roles that have no connection to their background. Every suggestion must trace back to something explicitly on the resume. Return them SORTED in this exact order: all "strong" fit roles first, then all "good" fit roles, then all "stretch" roles last. For each:
- "fit": "strong" = they're already doing this or close to it, "good" = natural next step with minor gaps, "stretch" = ambitious but rooted in their actual background
- "why": be hyper-specific — cite actual job titles, companies, skills, or metrics from their resume. Never use generic phrases.
- "keywordsToAdd": 3-5 keywords relevant to that specific role that are missing from their resume

SCORING DIMENSIONS:

atsScore (ATS Compliance) — CRITICAL RULE: You are analyzing EXTRACTED PLAIN TEXT from a PDF. You cannot see fonts, graphics, colors, columns, or visual layout from plain text alone. ONLY penalize for issues you can directly observe in the text itself. Never flag "potential" or "possible" formatting issues — only flag what you can definitively see.

Penalize ONLY for things observable in plain text:
- Non-standard section headers that you can read in the text (e.g. "My Story" instead of "EXPERIENCE")
- Missing or inconsistent date formats visible in the text
- Bullet characters other than • or standard dashes that appear in the text
- Contact info that appears buried mid-document instead of at the top
- Vague or absent section organization readable in the extracted text
- Special characters (©, ™, decorative symbols) visible in the text

DO NOT flag these unless you can see direct text evidence:
- Graphics, images, or logos (you cannot see these in plain text)
- Font choices or decorative fonts (invisible in plain text)
- Column layouts or text boxes (indistinguishable from single-column in extracted text)
- Visual skill bars or grids (only flag if the text shows rating systems like "Excel ████")
- Headers/footers (cannot be determined from extracted text)

If the resume text reads as clean, well-structured plain text with standard section headers and dates, give it a high atsScore (85+). Do not invent formatting concerns.

keywordMatch — if job description provided: % of critical job keywords and exact phrases found in resume. If no job description: evaluate against industry-standard keywords for the apparent role.

impactScore — how well bullet points communicate outcomes vs. responsibilities:
- 0-40: most bullets are responsibility-only ("Responsible for...", "Managed...")
- 41-70: mixed — some impact, some responsibility language
- 71-100: strong impact-driven language with metrics and outcomes throughout

CRITICAL — evaluate all five of these issue categories:

1. AIDA FRAMEWORK (Attention → Interest → Desire → Action):
   - ATTENTION: Does the summary/headline immediately communicate who this person is and what they're uniquely good at? Or is it a generic "Dedicated professional seeking challenging role"?
   - INTEREST: Does experience section show scope and context (team size, revenue, user base) to build credibility?
   - DESIRE: Are there 2-3 "signature achievements" that make a recruiter want to meet this person? Are results quantified with numbers, %, $?
   - ACTION: Are skills ATS-keyword-dense? Is contact info complete and prominent?

   CAR / STAR / WHO FRAMEWORK COMPLIANCE (evaluate every bullet):
   - CAR (Challenge → Action → Result): Does the bullet identify a problem or context, describe what the candidate specifically did, and show the outcome? Or is it just a flat responsibility statement?
   - STAR (Situation → Task → Action → Result): For more complex bullets, is there enough context (situation/task) before the action and result?
   - WHO (Work background → How → Outcome): Does the reader understand what the candidate was working on, how they approached it, and what happened?
   - Flag roles where fewer than half the bullets follow any of these structures — they will read as job descriptions, not accomplishments.

2. WEAK KEYWORD ARCHITECTURE:
   - Missing industry-standard action phrases and keywords for the apparent role/industry
   - Keywords present but buried (not in prominent positions — first bullet, summary, skills)
   - Acronyms without spelled-out form (e.g., "SEO" but not "Search Engine Optimization")

3. SENTENCE STRUCTURE & FORMATTING:
   - Passive voice or weak openers ("was responsible for", "helped to", "participated in", "assisted with")
   - Vague language ("various", "multiple projects", "several clients") — no specifics
   - Outdated filler phrases ("self-starter", "team player", "detail-oriented" with no evidence)
   - Inconsistent date formatting, inconsistent capitalization, inconsistent bullet style

4. ATS NON-COMPLIANCE (see atsScore above):
   - Flag structural issues that will cause ATS parsing failures

5. OUTDATED STYLE & LANGUAGE:
   - "Objective:" section (outdated — replace with SUMMARY)
   - "References available upon request" (wastes space, implied)
   - Long paragraphs in experience (should be bullets)
   - Function-first organization when chronological is expected
   - Skills section with outdated tools/technologies

Flag every section that fails any of these criteria. Be specific — name the section and the exact issue.${jobContext}

Resume:
${resumeText}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<ResumeAnalysis>(raw);
}

export interface EmploymentEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
}

export async function extractEmploymentDates(
  apiKey: string,
  resumeText?: string,
  _resumePdfBase64?: string
): Promise<EmploymentEntry[]> {
  if (!resumeText) throw new Error("Resume text is required.");

  const prompt = `Extract all work experience entries from this resume. Return a JSON object with a single key "entries" whose value is an array. Each item in the array must have exactly these fields:
{"company":"string","title":"string","startDate":"string","endDate":"string"}

Rules:
- startDate and endDate must use "Month Year" format (e.g. "January 2020") whenever the information is available
- If only a year is available, use just the year (e.g. "2020")
- For current/ongoing roles use "Present" as the endDate
- If a date is completely missing or unreadable, use "Unknown"
- List entries in reverse chronological order (most recent first)
- Include every job, internship, or work experience listed
- Return {"entries":[]} if no work experience is found

Resume:
${resumeText}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  const parsed = parseJson<{ entries: EmploymentEntry[] }>(raw);
  return parsed.entries ?? [];
}

export async function rewriteResume(
  apiKey: string,
  analysis: ResumeAnalysis,
  jobDescription?: string,
  originalResume?: string,
  _resumePdfBase64?: string,
  templateAddendum?: string,
  targetProfession?: string,
  titleSubstitutions?: { from: string; to: string }[],
  correctedDates?: EmploymentEntry[]
): Promise<string> {
  if (!originalResume) throw new Error("Original resume text is required.");

  const jobContext = jobDescription ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription}` : "";
  const correctedDatesContext = correctedDates && correctedDates.length > 0
    ? `\n\nEMPLOYMENT DATE CORRECTIONS: The user has verified and corrected these employment dates. Use EXACTLY these dates in the resume — do not alter them:\n${correctedDates.map(e => `• ${e.title} at ${e.company}: ${e.startDate} – ${e.endDate}`).join("\n")}`
    : "";
  const titleSubstitutionsContext = titleSubstitutions && titleSubstitutions.length > 0
    ? `\n\nJOB TITLE UPDATES: Replace the following job titles throughout the resume (in the EXPERIENCE section headers and anywhere else they appear). Use the exact replacement title given — do NOT alter seniority or add extra words:\n${titleSubstitutions.map(s => `• "${s.from}" → "${s.to}"`).join("\n")}`
    : "";
  const professionContext = targetProfession
    ? `\n\nCAREER PIVOT TARGET: "${targetProfession}"\nThe candidate is transitioning into this field. You must:\n- Reframe ALL existing experience through the lens of "${targetProfession}" — use vocabulary, keywords, and role language that a hiring manager in that field would expect to see\n- Surface every transferable skill and reframe it as directly applicable to "${targetProfession}"\n- Inject high-frequency ATS keywords specific to "${targetProfession}" naturally throughout SUMMARY, CORE COMPETENCIES, and EXPERIENCE\n- Rewrite the SUMMARY to position them as a career-changer with directly relevant strengths for "${targetProfession}"\n- Do NOT fabricate experience, dates, companies, or credentials — reframe only what exists`
    : "";
  const missingKeywords = analysis.missingKeywords.join(", ");
  const weaknesses = analysis.weaknesses.map(w => `- ${w.point}: ${w.explanation}`).join("\n");
  const suggestions = analysis.suggestions.map(s => `- [${s.priority}] ${s.action}: ${s.explanation}`).join("\n");

  const prompt = `You are a Certified Professional Resume Writer (CPRW) with 20+ years placing candidates at Fortune 500 companies. Your resumes consistently pass ATS at 90%+ and generate interview callbacks within 2 weeks. You write resumes that read like a real human wrote them — confident, specific, and impossible to ignore. Recruiters immediately notice the difference between your work and a generic AI output.${professionContext}

═══════════════════════════════════════════
STEP 0 — PRE-ANALYSIS (do this mentally before writing a single word)
═══════════════════════════════════════════
Before writing, identify these from the original resume:
1. The candidate's TOP 3 most impressive quantified achievements (numbers, %, $, team sizes, revenue). These MUST appear prominently in the SUMMARY and as strong bullets. Do not bury them.
2. The single biggest gap between this candidate's current presentation and the job posting (if provided). The rewrite must close that gap head-on.
3. The candidate's genuine differentiator — the one thing about their background that a recruiter would remember after reading 100 resumes. Build the SUMMARY around it.${jobDescription ? `\n4. The EXACT job title and company name from the job description below. Use these in the SUMMARY to show this resume was written for THIS role, not sprayed everywhere.` : ""}

═══════════════════════════════════════════
EXACT OUTPUT FORMAT — FOLLOW THIS PRECISELY
═══════════════════════════════════════════
Output the resume using EXACTLY this structure and line ordering. Do not deviate.

Line 1: Candidate full name — ALL CAPS, plain text, nothing else on this line
Line 2: Phone | Email | City, State | LinkedIn (ONLY if LinkedIn URL is explicitly present in the original resume — do NOT invent or add one) — use | as separator, plain text
Line 3: blank line

SUMMARY
[3-4 sentences. No bullets. Write in first-person-implied voice (no "I") — direct, confident, specific. Sound like the candidate sat down, thought hard about what makes them valuable, and wrote this themselves. Not a form. Not a template.

SUMMARY FRAMEWORK:
- Sentence 1: [Title] with [X] years in [specific domain/industry]. Lead with their single most impressive credential or achievement — the thing that earns the right to keep reading. Do NOT open with "Dynamic", "Results-driven", "Seasoned", "Dedicated", "Passionate", "Proven track record", "Highly motivated", or any cliché.
- Sentence 2: One concrete, specific thing they're genuinely great at — with a real example or number from their background. "Generated $2.4M in new contracts" beats "strong track record of sales success."
- Sentence 3: How they work / what they bring to a team / the approach that makes them effective. Should feel personal and specific, not generic.
- Sentence 4 (if job description provided): Explicitly connect to the TARGET ROLE — "Seeking to bring [specific strength] to [company name or role title] to [specific outcome they'll drive]." Make clear this resume was written for THIS job.

SUMMARY MUST include at least one real number, %, $, or scale metric from the original resume. If there are none, use scope language (team size, geographic reach, client count). The goal: a recruiter reads sentence 1 and cannot put it down.]

CORE COMPETENCIES
[Comma-separated keywords on ONE line — 9 to 12 terms. No bullets. No columns. Pick terms that reflect how this person actually works, not just industry buzzwords.]

SKILLS
[Categorized skill list — 2 to 4 categories on separate lines, format: Category: Skill 1, Skill 2, Skill 3. Example lines:
Technical: Microsoft Office, CRM Software, QuickBooks, Google Workspace
Languages: Spanish (Conversational), English (Native)
Draw categories from what is actually in the resume — do not fabricate. Omit this section entirely if the resume has no meaningful skills beyond what is in CORE COMPETENCIES.]

EXPERIENCE

[Job Title]
[Company Name | City, State | Month Year – Month Year]
• [bullet — see BULLET QUALITY below]
• [bullet]
• [bullet]
(3–6 bullets per role. Repeat block for each role, blank line between roles.)

EDUCATION
[Degree, Major]
[Institution | City, State | Year]

CERTIFICATIONS
[Name, Issuing Body, Year]
(omit section if none)

PROJECTS
[Project Name: one-line outcome]
(omit section if none)

═══════════════════════════════════════════
ATS HARD RULES — ZERO EXCEPTIONS
═══════════════════════════════════════════
- NO markdown: no *, no #, no **, no _, no backticks, no --
- NO tables, columns, or multi-column layouts
- Section headers: use ONLY these exact strings in ALL CAPS: SUMMARY, CORE COMPETENCIES, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS, PROJECTS
- Bullets: • character ONLY — never -, –, *, or any other character
- Dates: "Month Year – Month Year" format only (e.g. January 2021 – March 2023). Never year-only.
- One blank line between sections. No blank lines within a section.
- No "References available upon request", no "Objective:" lines
- No decorative separators, lines, or dividers

═══════════════════════════════════════════
BULLET QUALITY — FRAMEWORK-DRIVEN, HUMAN VOICE
═══════════════════════════════════════════
Every bullet must follow one of these three proven frameworks. Vary which framework you use across bullets — do NOT apply the same structure to every line.

FRAMEWORK 1 — CAR (Challenge → Action → Result):
Identify the problem or context, describe what the candidate specifically did, show the measurable outcome.
• Inherited a billing process with a 12% error rate — audited every account, rebuilt the workflow, and brought errors to under 1% within 90 days
• Lost 3 major clients in Q1 due to slow response times; restructured the support queue and cut average resolution time from 4 days to same-day

FRAMEWORK 2 — STAR (Situation → Task → Action → Result):
Use when more context is needed to make the achievement land. Compress tightly — STAR bullets can run long and should be pruned hard.
• When the company expanded to 3 new markets, took ownership of onboarding all incoming accounts while managing the existing book — retained 97% of existing clients with zero service interruption

FRAMEWORK 3 — WHO (Work background → How → Outcome):
Crisp and punchy. Great for quantified wins where the "what" is self-evident.
• Managed $2.4M in annual inventory across 4 locations; implemented a reorder threshold system that cut stockouts by 60%
• Trained and supervised 11-person team through seasonal volume spikes — consistently ranked #1 in region for customer satisfaction

BANNED openers: "Responsible for", "Helped", "Worked on", "Assisted with", "Duties included", "Was involved in", "Leveraged", "Utilized", "Spearheaded", "Championed", "Revolutionized", "Orchestrated"
BANNED patterns: starting every bullet the same way, cookie-cutter "X resulting in Y%" on every single line, flat responsibility statements with no outcome

REQUIRED: at least 2–3 bullets per role with specific numbers, %, $, or time frames. The rest must still describe scope or approach concretely — no vague language.

BAD (avoid this pattern):
• Leveraged cross-functional collaboration to orchestrate synergistic outcomes across stakeholder touchpoints
• Spearheaded the implementation of cutting-edge solutions resulting in significant improvements

═══════════════════════════════════════════
HUMAN WRITING PRINCIPLES — READ CAREFULLY
═══════════════════════════════════════════
- Write the summary as if the candidate sat down and described themselves honestly and confidently — not as if a form was filled out
- Vary bullet length — some short and punchy, some a full sentence with context
- Avoid buzzword stacking. One strong specific word beats three vague impressive-sounding ones.
- If the original resume has personality or a distinctive voice, preserve it
- Don't make every role sound identical — reflect the actual scope differences
- Real humans use dashes, context, and qualifiers naturally: "after inheriting a broken system", "despite a tight timeline", "for the first time in company history"

═══════════════════════════════════════════
CONTENT RULES
═══════════════════════════════════════════
- Preserve ALL real experience, dates, companies, and education — never fabricate
- NEVER invent contact information (phone, email, LinkedIn, website, address) that does not appear in the original resume
- Weave in missing keywords naturally — they must read as part of the sentence, not bolted on: ${missingKeywords || "none identified"}
${weaknesses ? `- Fix these weaknesses:\n${weaknesses}` : ""}
${suggestions ? `- Apply these improvements:\n${suggestions}` : ""}
- Both acronym AND spelled-out form on first use: e.g., "Search Engine Optimization (SEO)"
- Spread keywords across SUMMARY, CORE COMPETENCIES, and EXPERIENCE${jobContext ? "\n- Mirror exact phrasing from the job description — ATS matches strings not synonyms" : ""}

${templateAddendum ?? ""}

═══════════════════════════════════════════
CRITICAL OUTPUT RULES
═══════════════════════════════════════════
- Return ONLY the plain text resume — nothing else
- NO XML, HTML, or angle-bracket tags of any kind
- NO commentary, preamble, explanation, or notes
- NO markdown fences
- First character of your response MUST be the candidate's name${correctedDatesContext}${titleSubstitutionsContext}${jobContext}

ORIGINAL RESUME:
${originalResume}`;

  return callOpenAI(apiKey, prompt, false, OPENAI_MODEL_REWRITE, 8192);
}

export async function analyzeNDA(
  apiKey: string,
  text?: string,
  _pdfBase64?: string
): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");

  const prompt = `You are a business attorney specializing in confidentiality and non-disclosure agreements. Analyze this NDA and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "summary": "2-3 sentence plain English summary (mutual vs one-sided, parties, purpose, duration)",
  "keyTerms": [{"term": "string", "value": "string", "description": "string"}],
  "redFlags": [{"issue": "string", "severity": "low|medium|high", "explanation": "string"}],
  "missingClauses": [{"clause": "string", "importance": "recommended|important|critical", "explanation": "string"}],
  "overallRisk": "low|medium|high",
  "riskScore": 0-100,
  "recommendation": "string with overall recommendation"
}

For keyTerms focus on: mutual vs unilateral, duration of confidentiality, definition of confidential information, exclusions from confidentiality, permitted disclosures, return/destruction of materials, governing law, dispute resolution.
For redFlags look for: overly broad definition of confidential information (covering publicly known info), no expiration date (perpetual NDAs), hidden non-compete or non-solicitation clauses, one-sided terms that only restrict one party, no carve-outs for independently developed info, required disclosure to government/courts without notice, excessive damages clauses, automatic assignment of IP.
For missingClauses check for: time limit on confidentiality, clear definition of what is confidential, standard exclusions (public domain, independently developed, received from third party), permitted disclosure process, return or destruction of materials clause, mutual obligations if appropriate.
Be thorough. Flag real risks to the signing party.

NDA:
${text}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<ContractAnalysis>(raw);
}

export async function analyzeEmploymentContract(
  apiKey: string,
  text?: string,
  _pdfBase64?: string
): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");

  const prompt = `You are an employment attorney. Analyze this employment contract and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "summary": "2-3 sentence plain English summary (role, compensation, term, key restrictions)",
  "keyTerms": [{"term": "string", "value": "string", "description": "string"}],
  "redFlags": [{"issue": "string", "severity": "low|medium|high", "explanation": "string"}],
  "missingClauses": [{"clause": "string", "importance": "recommended|important|critical", "explanation": "string"}],
  "overallRisk": "low|medium|high",
  "riskScore": 0-100,
  "recommendation": "string with overall recommendation"
}

For keyTerms focus on: compensation and bonus structure, start date and term, at-will vs fixed term, non-compete scope and duration, non-solicitation clause, IP assignment scope, severance terms, benefits summary, arbitration requirement, governing law.
For redFlags look for: overbroad non-compete (long duration, wide geography, vague industry restrictions), IP assignment that covers personal-time work unrelated to employer's business, mandatory arbitration waiving class action rights, no severance protection, unilateral modification clauses, clawback provisions, excessive liquidated damages, automatic renewal at lower compensation, probationary period with no protections, non-disparagement that prevents reporting illegal activity.
For missingClauses check for: clear compensation definition, equity vesting schedule (if applicable), severance terms, defined non-compete geographic and time limits, IP carve-out for personal projects, termination notice requirements, bonus eligibility criteria, reimbursement policy, remote/work-from-home policy.
Be thorough. Flag real employment risks.

Employment Contract:
${text}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<ContractAnalysis>(raw);
}

export async function analyzeLease(
  apiKey: string,
  text?: string,
  _pdfBase64?: string
): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");

  const prompt = `You are a tenant rights attorney specializing in residential and commercial lease agreements. Analyze this lease and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "summary": "2-3 sentence plain English summary of the lease (type, parties, term, rent)",
  "keyTerms": [{"term": "string", "value": "string", "description": "string"}],
  "redFlags": [{"issue": "string", "severity": "low|medium|high", "explanation": "string"}],
  "missingClauses": [{"clause": "string", "importance": "recommended|important|critical", "explanation": "string"}],
  "overallRisk": "low|medium|high",
  "riskScore": 0-100,
  "recommendation": "string with overall recommendation"
}

For keyTerms focus on: monthly rent, security deposit amount, lease term/dates, notice to vacate period, late fees, pet policy, subletting rules, early termination penalty, utilities responsibility, maintenance responsibilities, rent increase terms.
For redFlags look for: excessive security deposit (over 2 months rent in most states), no habitability guarantee, automatic renewal traps, unreasonable entry rights, one-sided repair responsibility, waived tenant rights, hidden fees, overly broad landlord right to terminate, no grace period for late rent, prohibited subletting without cause.
For missingClauses check for: move-in inspection clause, security deposit return timeline, repair/maintenance process, notice required for landlord entry, lease renewal terms, early termination process, dispute resolution, what happens if property is sold.
Be thorough. Flag real tenant risks.

Lease Agreement:
${text}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<ContractAnalysis>(raw);
}

export async function analyzeCourtDocument(
  apiKey: string,
  text?: string,
  _pdfBase64?: string
): Promise<CourtDocumentAnalysis> {
  if (!text) throw new Error("Document text is required.");

  const prompt = `You are an experienced litigation attorney with deep knowledge of consumer protection law including the FDCPA and FCRA. Analyze this court document and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "summary": "2-3 sentence plain English summary of what this document is and what it means for the parties",
  "documentType": "string — e.g. Complaint, Motion to Dismiss, Subpoena, Court Order, Summons, Judgment, etc.",
  "parties": [{"role": "string", "name": "string", "description": "string"}],
  "keyDates": [{"label": "string", "date": "string", "description": "string", "isDeadline": true|false}],
  "claims": [{"claim": "string", "explanation": "string"}],
  "reliefSought": "string — what the filing party is asking the court to do",
  "keyFindings": [{"finding": "string", "significance": "low|medium|high", "explanation": "string"}],
  "actionItems": [{"action": "string", "urgency": "low|medium|high", "deadline": "string|null", "explanation": "string"}],
  "overallRisk": "low|medium|high",
  "riskScore": 0-100,
  "recommendation": "string — plain English advice on what the recipient or affected party should do",
  "disputeOpportunities": {
    "applicable": true|false,
    "opportunities": [
      {
        "type": "FDCPA|FCRA|SOL|GENERAL",
        "creditorName": "string",
        "accountNumber": "string|null",
        "amount": "string|null",
        "reason": "string — specific dispute reason",
        "letterType": "debt_validation|bureau_dispute|cease_and_desist",
        "explanation": "string — plain English explanation of why this is disputable and the legal basis"
      }
    ]
  }
}

For parties: include plaintiff, defendant, judge, attorneys, third parties if mentioned.
For keyDates: highlight response deadlines, hearing dates, filing deadlines — mark isDeadline: true for anything requiring action by a date.
For claims: list each legal claim or count asserted (e.g. breach of contract, negligence, fraud).
For keyFindings: note important factual or legal findings, orders, or rulings — severity reflects impact on the receiving party.
For actionItems: list concrete steps the reader should take, ordered by urgency. If a response deadline exists, include it.

For disputeOpportunities:
- Set applicable: true ONLY if the document involves debt collection, credit reporting, a money judgment, or creditor/collector lawsuits.
- FDCPA opportunities: debt collector suing without first sending a validation notice, suing on a debt past the statute of limitations (varies by state but commonly 3-6 years), collection attempts without proper documentation, violations of FDCPA § 1692e (false/misleading representations) or § 1692f (unfair practices).
- FCRA opportunities: if the document references accounts that may be inaccurately reported to credit bureaus — wrong balance, wrong status, duplicate entries, re-aging of old debt, or accounts that should be removed.
- SOL opportunities: if the debt or claim appears time-barred based on the dates mentioned.
- GENERAL: any other disputable element that could benefit the defendant.
- letterType "debt_validation": send to the debt collector/plaintiff demanding validation under FDCPA § 1692g.
- letterType "bureau_dispute": send to credit bureaus to dispute inaccurate reporting under FCRA § 611.
- letterType "cease_and_desist": when collector should stop all contact.
- If the document is not debt/credit related (e.g. criminal case, family law, property dispute), set applicable: false and opportunities: [].
Be thorough. This helps non-lawyers understand serious legal documents.

Court Document:
${text}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<CourtDocumentAnalysis>(raw);
}

export interface CourtDisputeOpportunity {
  type: "FDCPA" | "FCRA" | "SOL" | "GENERAL";
  creditorName: string;
  accountNumber: string | null;
  amount: string | null;
  reason: string;
  letterType: "debt_validation" | "bureau_dispute" | "cease_and_desist";
  explanation: string;
}

export interface CourtDocumentAnalysis {
  summary: string;
  documentType: string;
  parties: { role: string; name: string; description: string }[];
  keyDates: { label: string; date: string; description: string; isDeadline: boolean }[];
  claims: { claim: string; explanation: string }[];
  reliefSought: string;
  keyFindings: { finding: string; significance: "low" | "medium" | "high"; explanation: string }[];
  actionItems: { action: string; urgency: "low" | "medium" | "high"; deadline: string | null; explanation: string }[];
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
  recommendation: string;
  disputeOpportunities: {
    applicable: boolean;
    opportunities: CourtDisputeOpportunity[];
  };
}

export interface ContractAnalysis {
  summary: string;
  keyTerms: { term: string; value: string; description: string }[];
  redFlags: { issue: string; severity: "low" | "medium" | "high"; explanation: string }[];
  missingClauses: { clause: string; importance: "recommended" | "important" | "critical"; explanation: string }[];
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
  recommendation: string;
}

export async function analyzeCollectionLetter(
  apiKey: string,
  text?: string,
  _pdfBase64?: string,
  _imageMimeType?: string
): Promise<CollectionLetterAnalysis> {
  if (!text) throw new Error("Document text is required.");

  const prompt = `You are a consumer rights attorney specializing in debt collection law (FDCPA), credit reporting (FCRA), and consumer protection. Analyze this letter received from a debt collector or creditor and respond with ONLY a raw JSON object (no markdown, no code fences) with exactly these fields:
{
  "creditorName": "string or null — name of the collection agency or original creditor",
  "originalCreditor": "string or null — original creditor if different from the collector",
  "letterDate": "YYYY-MM-DD or null",
  "letterType": "collection_notice" | "demand_letter" | "settlement_offer" | "judgment_notice" | "debt_validation_response" | "final_notice" | "other",
  "amountClaimed": number or null,
  "accountLast4": "string or null — last 4 digits of account number if shown",
  "deadline": "YYYY-MM-DD or null — any response deadline mentioned",
  "keyClaimsAndDemands": ["string"],
  "redFlags": [{"issue": "string", "severity": "low|medium|high", "explanation": "string"}],
  "yourLegalRights": [{"right": "string", "legalBasis": "string — e.g. FDCPA § 809", "explanation": "string"}],
  "recommendedActions": [{"action": "string", "priority": "HIGH|MEDIUM|LOW", "description": "string"}],
  "debtValidationWindow": true|false,
  "statuteOfLimitationsConcern": true|false,
  "summary": "2-3 sentence plain English summary of what this letter is and what it means for you",
  "overallRisk": "low|medium|high",
  "riskScore": 0-100
}

Guidelines:
- keyClaimsAndDemands: every specific claim, debt amount, threat, or demand in the letter
- redFlags: look for FDCPA violations — threats to sue on time-barred debt, misrepresenting amount owed, threatening actions they cannot legally take, failing to include required validation notice (within 5 days of first contact), impersonating an attorney or government agency, using abusive language
- yourLegalRights: list 3-6 specific rights under FDCPA, FCRA, or state consumer protection law. Always include the 30-day debt validation right if it's a first contact
- recommendedActions: 3-5 prioritized steps ordered by urgency (e.g. send validation letter within 30 days, do not make payment before validating, consult attorney if sued, check credit report)
- debtValidationWindow: true if the consumer still has 30 days from first contact to request validation (i.e. this appears to be initial communication or recent)
- statuteOfLimitationsConcern: true if there are signs the debt may be time-barred (old dates, references to very old accounts)
- riskScore: 0=no real threat, 100=extremely urgent — factor in amount, deadline, and litigation risk
Be thorough and accurate. Consumer protection law expertise is critical here.

Letter:
${text}`;

  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<CollectionLetterAnalysis>(raw);
}

export interface CollectionLetterAnalysis {
  creditorName: string | null;
  originalCreditor: string | null;
  letterDate: string | null;
  letterType: "collection_notice" | "demand_letter" | "settlement_offer" | "judgment_notice" | "debt_validation_response" | "final_notice" | "other";
  amountClaimed: number | null;
  accountLast4: string | null;
  deadline: string | null;
  keyClaimsAndDemands: string[];
  redFlags: { issue: string; severity: "low" | "medium" | "high"; explanation: string }[];
  yourLegalRights: { right: string; legalBasis: string; explanation: string }[];
  recommendedActions: { action: string; priority: "HIGH" | "MEDIUM" | "LOW"; description: string }[];
  debtValidationWindow: boolean;
  statuteOfLimitationsConcern: boolean;
  summary: string;
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
}

export async function analyzeNonCompete(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are an employment attorney specializing in restrictive covenants. Analyze this non-compete agreement and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: scope, duration, geography, who it binds","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: geographic scope, duration, covered activities/industry, consideration offered, carve-outs, governing state law, enforcement remedy (injunction vs damages).
redFlags: overbroad geography (nationwide with no legitimate business interest), excessive duration (>1-2 years in most states), vague "business activities" definition covering unrelated work, no garden leave payment, non-solicitation of customers you never worked with, attempt to restrict freelance/personal-time work, states with strict non-compete laws (CA, MN, ND, OK — near-unenforceable there).
missingClauses: specific geographic limits, list of covered competitors, legitimate business interest justification, consideration beyond continued employment, carve-outs for pre-existing clients, severability clause.
Be thorough — non-competes can devastate careers if signed blindly.

Non-Compete Agreement:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeSeveranceAgreement(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are an employment attorney specializing in severance agreements and ADEA/OWBPA compliance. Analyze this severance agreement and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: severance amount, key releases, time window, notable restrictions","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: severance amount and payment schedule, COBRA continuation period and cost, equity treatment (vesting acceleration, exercise window), ADEA/OWBPA 21-day review period (45 days if group layoff), 7-day revocation right, claims being released, non-disparagement scope, reference letter commitment, return of property obligations.
redFlags: waiver of ADEA rights without proper 21/45-day window, waiver of EEOC filing rights (illegal), mutual non-disparagement missing (one-sided), clawback provisions, non-compete or non-solicitation attached with no additional consideration, no COBRA subsidy, release of unknown claims without California-style carve-out, overly broad IP assignment on departure.
missingClauses: neutral reference letter commitment, ADEA/OWBPA compliant language for workers 40+, COBRA cost information, explicit list of released claims, 7-day revocation window, outplacement services, equity vesting acceleration.
Highlight the 21-day consideration period prominently if found or missing.

Severance Agreement:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeBusinessPurchaseAgreement(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are a mergers and acquisitions attorney. Analyze this business purchase agreement or letter of intent and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: deal type, purchase price, structure, key conditions","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: purchase price and payment structure, earnout terms and milestones, representations and warranties scope, indemnification caps and baskets, closing conditions, working capital adjustment mechanism, seller non-compete post-closing, transition services period, escrow holdback amount and duration.
redFlags: unlimited indemnification with no cap (expose seller to massive liability), earnout metrics controlled entirely by buyer (sandbagging risk), material adverse change definition too broad, no rep and warranty insurance mentioned for large deals, seller non-compete too long or geographically broad, no working capital peg mechanism, missing MAC carve-outs for industry-wide events, personal guarantees without liability limits.
missingClauses: indemnification cap (often 10-15% of purchase price), basket/deductible for rep/warranty claims, survival period for representations, working capital target and adjustment process, specific earnout dispute resolution mechanism, IP assignment and registration, employee retention provisions.

Business Purchase Agreement:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeHoaDocuments(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are a real estate attorney specializing in community association law (HOAs, condos, co-ops). Analyze this HOA governing document (CC&Rs, bylaws, or rules) and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: property type, key restrictions, assessment authority, notable rules","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: monthly/annual assessment amount, special assessment authority (cap and voting threshold), fining authority and process, architectural review requirements, rental restrictions (min rental period, cap on rentals), pet policies, parking rules, reserve fund requirement, board member election process.
redFlags: board can raise assessments without homeowner vote (unlimited authority), fines with no due process or appeal, restrictions on For Sale signs or political speech (may violate law), prohibition on solar panels or EV chargers (may violate state law), reserve fund below 70% funded (financial health risk), board can amend rules without member vote, overly broad nuisance definitions giving board broad enforcement discretion.
missingClauses: reserve fund adequacy disclosure, alternative dispute resolution before fines, owner right to inspect financial records, maximum assessment increase per year, clear definition of "common areas" vs owner responsibility, architectural standards in writing.

HOA Document:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzePromissoryNote(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are a commercial lending attorney. Analyze this promissory note or loan agreement and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: loan amount, interest rate, repayment terms, collateral","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: principal amount, interest rate (fixed vs variable), APR if stated, repayment schedule (amortization), maturity date, prepayment penalty and amount, collateral and security interest, default definition, acceleration clause, personal guarantee requirement, late payment fee.
redFlags: interest rate above state usury limit, compounding interest not clearly disclosed, acceleration clause with no cure period (immediate full balance due on any default), prepayment penalty that exceeds interest savings, cross-default provisions (default on other loans triggers this one), personal guarantee with unlimited recourse, confession of judgment clause (waives right to defend), auto-renewal at higher rate, balloon payment not clearly disclosed.
missingClauses: clear APR disclosure, prepayment rights, default cure period and notice requirement, governing law and jurisdiction, loan forgiveness conditions (if applicable), lender's duty to provide payoff statement, right to contest default.

Promissory Note / Loan Agreement:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzePowerOfAttorney(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are an elder law and estate planning attorney. Analyze this power of attorney document and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: type of POA, scope of authority, durability, principal and agent","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: POA type (general, limited, durable, healthcare/medical, springing), principal and agent names, scope of authority granted, effective date and triggering conditions (immediate vs springing), durability (does it survive incapacity), expiration date or conditions, successor agent named, witnessing and notarization requirements.
redFlags: overly broad "general authority" with no limitations (agent can do anything), no durability clause (POA becomes void when most needed — at incapacity), single agent with no successor named, no accounting requirement for agent, gift-giving powers with no dollar limit (elder financial abuse risk), self-dealing allowed without court approval, no revocation process defined, not properly witnessed/notarized per state law.
missingClauses: durability clause for financial POAs, successor agent designation, agent compensation terms (paid vs unpaid), accounting and record-keeping requirement, specific prohibited transactions, revocation process, governing state law, healthcare proxy separate from financial POA.
Note that POA requirements vary significantly by state — flag any missing state-law formalities.

Power of Attorney:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeInsurancePolicy(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are an insurance coverage attorney. Analyze this insurance policy (health, auto, home, life, or other) and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: policy type, insurer, coverage limits, key exclusions, premium","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: policy type, coverage limits (per-occurrence and aggregate), deductible amount, premium, policy period, named insured, exclusions list, claims filing deadline, subrogation rights, cancellation terms, coordination of benefits (if health), replacement cost vs actual cash value (if property).
redFlags: exclusions so broad they swallow most realistic claims, short claims filing window (some policies require notice within days), subrogation waiver absent for business policies, no replacement cost coverage (ACV pays far less for older property), mandatory arbitration for coverage disputes, concurrent causation exclusion, anti-assignment clause preventing you from assigning benefits, pre-existing condition exclusion for health, cancellation for any reason with short notice, no guaranteed renewability.
missingClauses: replacement cost vs ACV clearly stated, grace period for late premiums, guaranteed renewability or non-cancellation commitment, independent appraisal right for disputed claims, extended reporting period (tail coverage) for claims-made policies, umbrella policy coordination, business interruption coverage details.

Insurance Policy:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeVehiclePurchaseAgreement(apiKey: string, text?: string, _pdfBase64?: string): Promise<ContractAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are a consumer protection attorney specializing in auto sales. Analyze this vehicle purchase or financing agreement and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"summary":"2-3 sentences: vehicle, total price, financing terms, key add-ons","keyTerms":[{"term":"string","value":"string","description":"string"}],"redFlags":[{"issue":"string","severity":"low|medium|high","explanation":"string"}],"missingClauses":[{"clause":"string","importance":"recommended|important|critical","explanation":"string"}],"overallRisk":"low|medium|high","riskScore":0-100,"recommendation":"string"}
keyTerms: vehicle year/make/model/VIN, sale price vs MSRP, trade-in credit, down payment, APR, loan term, monthly payment, total amount financed, total cost of financing, add-ons (GAP insurance, extended warranty, paint protection, tire/wheel), balloon payment if applicable, right to cancel/cooling off period.
redFlags: spot delivery / yo-yo financing clause (dealer can call back the deal days later at worse terms), payment packing (monthly payment inflated with hidden add-ons), GAP insurance from dealer at 3-5x market price (buy from insurer directly for $200-$300/yr), dealer arbitration clause waiving class action rights, "as-is" sale with no disclosure of known defects, interest rate marked up significantly above buy rate (dealer profit on financing), add-ons added without clear disclosure, odometer mismatch, trade-in value far below market.
missingClauses: itemized breakdown of all fees, VIN and odometer statement, right to cancel if financing falls through, written warranty terms, condition disclosure for used vehicles, trade-in payoff guarantee.

Vehicle Purchase Agreement:
${text}`;
  return parseJson<ContractAnalysis>(await callOpenAI(apiKey, prompt, true));
}

export async function analyzeMedicalBill(apiKey: string, text?: string, _pdfBase64?: string, _imageMimeType?: string): Promise<MedicalBillAnalysis> {
  if (!text) throw new Error("Document text is required.");
  const prompt = `You are a medical billing advocate and patient rights expert. Analyze this medical bill or Explanation of Benefits (EOB) and respond with ONLY a raw JSON object (no markdown, no code fences) in exactly this format:
{"facilityName":null,"billDate":null,"totalBilled":null,"totalAfterInsurance":null,"patientResponsibility":null,"commonErrors":[{"error":"string","severity":"low|medium|high","explanation":"string","potentialSavings":"string or null"}],"lineItems":[{"code":"string or null","description":"string","amountBilled":null,"flag":"ok|questionable|error|null"}],"patientRights":[{"right":"string","explanation":"string"}],"recommendedActions":[{"action":"string","priority":"HIGH|MEDIUM|LOW","description":"string"}],"summary":"2-3 sentence plain-English summary","overallRisk":"low|medium|high","riskScore":0-100}

facilityName: hospital/clinic name if visible
billDate: date of bill or service
totalBilled: total charges before insurance
totalAfterInsurance: amount after insurance adjustment
patientResponsibility: what patient owes
lineItems: extract visible line items with CPT/billing codes if shown; flag as "questionable" if the description seems inconsistent with the visit type, duplicated, or unusual
commonErrors to check for: duplicate billing (same procedure billed twice), upcoding (simple visit billed as complex), unbundling (procedures that should be billed together split to inflate cost), balance billing (billing above network-allowed amount for in-network provider), wrong patient/date, services not rendered, incorrect insurance payment applied, failure to apply prompt-pay discount, charge master rate vs negotiated rate discrepancy
patientRights: right to itemized bill, right to dispute billing errors, right to apply for financial assistance/charity care, No Surprises Act protections, ERISA appeal rights for employer plans, right to request medical records
recommendedActions: request itemized bill (always #1 if not already itemized), compare against EOB, call provider billing department with specific dispute, contact insurer to verify payment applied correctly, apply for financial assistance, contact state insurance commissioner if unresolved
riskScore: 0=clean bill, 100=multiple serious errors or very large balance — weight heavily by dollar amount at stake
Return only raw JSON.

Medical Bill:
${text}`;
  const raw = await callOpenAI(apiKey, prompt, true);
  return parseJson<MedicalBillAnalysis>(raw);
}

export interface MedicalBillAnalysis {
  facilityName: string | null;
  billDate: string | null;
  totalBilled: number | null;
  totalAfterInsurance: number | null;
  patientResponsibility: number | null;
  commonErrors: { error: string; severity: "low" | "medium" | "high"; explanation: string; potentialSavings: string | null }[];
  lineItems: { code: string | null; description: string; amountBilled: number | null; flag: "ok" | "questionable" | "error" | null }[];
  patientRights: { right: string; explanation: string }[];
  recommendedActions: { action: string; priority: "HIGH" | "MEDIUM" | "LOW"; description: string }[];
  summary: string;
  overallRisk: "low" | "medium" | "high";
  riskScore: number;
}

export interface ResumeAnalysis {
  overallScore: number;
  atsScore: number;
  keywordMatch: number;
  impactScore: number;
  foundKeywords: string[];
  missingKeywords: string[];
  strengths: { point: string; explanation: string }[];
  weaknesses: { point: string; explanation: string }[];
  suggestions: { action: string; priority: "low" | "medium" | "high"; explanation: string }[];
  summary: string;
  careerOptions?: {
    title: string;
    fit: "strong" | "good" | "stretch";
    why: string;
    keywordsToAdd: string[];
  }[];
  jobTitleRecommendations?: {
    current: string;
    recommended: string[];
    reason: string;
  }[];
}

export async function generateCoverLetter(
  apiKey: string,
  jobDescription: string,
  resumeText?: string,
  _resumePdfBase64?: string
): Promise<string> {
  if (!resumeText) throw new Error("Resume text is required.");

  const prompt = `You are a professional cover letter writer who has helped thousands of candidates land interviews at top companies. You write cover letters that feel personal, confident, and impossible to ignore — not templates, not AI fluff.

═══════════════════════════════════════════
STEP 0 — PRE-ANALYSIS (do this before writing)
═══════════════════════════════════════════
From the job description, identify:
1. The COMPANY NAME — use it in the letter. Generic "your company" is a red flag.
2. The ROLE TITLE — use the exact title from the posting.
3. The TOP 2 REQUIREMENTS the employer cares most about (usually in the first 3 bullets of the job post, or most repeated phrases).
4. One specific thing about this company or role that would genuinely excite a qualified candidate — a product, market, mission, or challenge mentioned in the posting.

From the resume, identify:
5. The candidate's SINGLE STRONGEST achievement that maps to requirement #1 above — ideally with a number.
6. A SECOND achievement that maps to requirement #2 — also specific.

These 2 achievements are the spine of the letter. Everything else supports them.

═══════════════════════════════════════════
COVER LETTER STRUCTURE
═══════════════════════════════════════════

PARAGRAPH 1 — THE HOOK (3-4 sentences):
Do NOT open with "I am writing to apply for..." or any variation.
Open with the candidate's strongest qualification meeting the role's biggest need — in one punchy sentence. Then add context that earns credibility: years of experience, scale of work, or a relevant credential. Close with a clear statement of what they're bringing to this specific role at this specific company.

BAD: "I am excited to apply for the Marketing Manager position at Acme Corp. I believe my experience makes me a strong fit."
GOOD: "When [Company] is looking for someone who can take a marketing team from 3 to 30 and double pipeline in under 18 months, that's a challenge I've already solved. Over the past 6 years at [previous company], I led exactly that kind of growth — building the infrastructure, hiring the team, and driving $4.2M in attributed revenue by the time I left."

PARAGRAPH 2 — PROOF (4-5 sentences):
Two specific, quantified achievements that directly address the top 2 requirements. Tell a micro-story for each:
- What the situation was
- What the candidate did specifically
- What the measurable result was
Do NOT list bullets. Write this as connected prose. Real numbers required — if the resume has none, use scope language (team size, number of accounts, revenue managed).

PARAGRAPH 3 — WHY THIS COMPANY (3-4 sentences):
Reference something SPECIFIC from the job description — a product, challenge, mission statement, or growth stage. Show that this isn't a mass-applied letter. Connect that specific thing to something in the candidate's background. One sentence should make it undeniable they've thought about THIS role, not just "any role."

PARAGRAPH 4 — CLOSE (2-3 sentences):
Confident, not desperate. Express genuine enthusiasm. Request the conversation, not "the opportunity to interview." End on something memorable — a result they'll deliver or a question they're excited to explore with the team.

Sign off with: Sincerely, [Candidate Name from resume]

═══════════════════════════════════════════
STRICT RULES
═══════════════════════════════════════════
- Plain text only — no markdown, no bold, no asterisks, no bullets
- Full blank line between each paragraph
- Maximum 400 words in the body (not counting date/salutation/sign-off)
- Tone: confident, warm, direct. Sound like a high-performer who doesn't need to beg.
- BANNED phrases: "I am a hard worker", "team player", "passionate about", "I believe I would be a great fit", "I am writing to apply", "I am excited to apply", "I think I would", "Leveraged", "Spearheaded", "Orchestrated", "Synergy", "Results-driven"
- Start with the date: ${new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
- Then blank line, then "Dear Hiring Manager,"

Target Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return ONLY the cover letter text. No commentary, no preamble, no explanation. First character must be the date.`;

  return callOpenAI(apiKey, prompt, false, OPENAI_MODEL_REWRITE, 2048);
}
