export interface ResumeTemplate {
  id: string;
  name: string;
  tagline: string;
  bestFor: string;
  features: string[];
  accentHex: string;
  previewStyle: "classic" | "modern" | "executive" | "technical" | "minimal";
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  // ── Classic ──────────────────────────────────────────────────────────────
  {
    id: "classic",
    name: "Classic ATS",
    tagline: "Timeless single-column, trusted by recruiters everywhere",
    bestFor: "Finance · Law · Accounting · HR · Government",
    features: ["Single-column layout", "Serif typography", "All-caps section headers", "100% ATS safe"],
    accentHex: "#1e293b",
    previewStyle: "classic",
  },
  {
    id: "classic-2col",
    name: "Classic Two-Column",
    tagline: "Traditional serif with a modern sidebar layout",
    bestFor: "Finance · Law · Accounting · HR · Government",
    features: ["Two-column layout", "Sidebar for skills & certs", "Serif typography", "ATS-optimized content"],
    accentHex: "#1e293b",
    previewStyle: "classic",
  },
  // ── Modern ───────────────────────────────────────────────────────────────
  {
    id: "modern",
    name: "Modern ATS",
    tagline: "Clean lines, red accent bar, zero clutter",
    bestFor: "Tech · Startups · Product · Marketing · SaaS",
    features: ["Single-column layout", "Bold red header", "Strong name display", "100% ATS safe"],
    accentHex: "#DC2626",
    previewStyle: "modern",
  },
  {
    id: "modern-2col",
    name: "Modern Two-Column",
    tagline: "Bold red header with dark sidebar accent",
    bestFor: "Tech · Startups · Product · Marketing · SaaS",
    features: ["Two-column layout", "Red header + dark sidebar", "Skills prominently placed", "ATS-optimized content"],
    accentHex: "#DC2626",
    previewStyle: "modern",
  },
  // ── Executive ─────────────────────────────────────────────────────────────
  {
    id: "executive-ats",
    name: "Executive ATS",
    tagline: "Command presence in a clean single-column format",
    bestFor: "C-Suite · VP · Director · Senior Leadership",
    features: ["Single-column layout", "Navy header bar", "Achievement-focused", "100% ATS safe"],
    accentHex: "#1D4ED8",
    previewStyle: "executive",
  },
  {
    id: "executive",
    name: "Executive Two-Column",
    tagline: "Authority and scope with a polished sidebar",
    bestFor: "C-Suite · VP · Director · Senior Leadership",
    features: ["Two-column layout", "Navy sidebar", "Signature achievements", "ATS-optimized content"],
    accentHex: "#1D4ED8",
    previewStyle: "executive",
  },
  // ── Technical ─────────────────────────────────────────────────────────────
  {
    id: "technical-ats",
    name: "Technical ATS",
    tagline: "Skills-first single-column for engineering roles",
    bestFor: "Software Engineers · Data Scientists · DevOps · IT",
    features: ["Single-column layout", "Green accent", "Tech stack prominence", "100% ATS safe"],
    accentHex: "#059669",
    previewStyle: "technical",
  },
  {
    id: "technical",
    name: "Technical Two-Column",
    tagline: "Skills-first layout with a dedicated tech sidebar",
    bestFor: "Software Engineers · Data Scientists · DevOps · IT",
    features: ["Two-column layout", "Green sidebar for skills", "Project section included", "ATS-optimized content"],
    accentHex: "#059669",
    previewStyle: "technical",
  },
  // ── Entry Level ───────────────────────────────────────────────────────────
  {
    id: "entry",
    name: "Entry Level ATS",
    tagline: "Education-forward single-column for new grads",
    bestFor: "New Graduates · Career Changers · Internships",
    features: ["Single-column layout", "Education prominently placed", "Transferable skills emphasis", "100% ATS safe"],
    accentHex: "#7C3AED",
    previewStyle: "minimal",
  },
  {
    id: "entry-2col",
    name: "Entry Two-Column",
    tagline: "Fresh purple design with sidebar for new grads",
    bestFor: "New Graduates · Career Changers · Internships",
    features: ["Two-column layout", "Purple gradient header", "Education in sidebar", "ATS-optimized content"],
    accentHex: "#7C3AED",
    previewStyle: "minimal",
  },
];

export function getTemplate(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find(t => t.id === id) ?? RESUME_TEMPLATES[0];
}

// Extra prompt instructions per template (appended to the base Gemini prompt)
export function getTemplatePromptAddendum(templateId: string): string {
  switch (templateId) {
    case "classic":
    case "classic-2col":
      return `
TEMPLATE STYLE: Classic Professional
- Tone: formal, measured, authoritative. No casual language.
- Bullet length: 1.5–2 lines each. Dense with context and metrics.
- Summary: 3-4 sentences, written in first-person-omitted style ("Seasoned CPA with..." not "I am a...").
- Keep section order: CONTACT, SUMMARY, CORE COMPETENCIES, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS.`;

    case "modern":
    case "modern-2col":
      return `
TEMPLATE STYLE: Modern Minimalist
- Tone: confident, direct, achievement-driven. No corporate filler.
- Bullet length: 1–1.5 lines each. Tight. Every word counts.
- Summary: 2-3 punchy sentences. Open with the candidate's single strongest differentiator.
- Keep section order: CONTACT, SUMMARY, CORE COMPETENCIES, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS.`;

    case "executive":
    case "executive-ats":
      return `
TEMPLATE STYLE: Executive
- Tone: commanding, strategic, board-room-ready. Shows the "so what" behind every decision.
- Summary: 4 lines max. Position the candidate as a business driver, not a task-doer. Mention P&L, team scale, or strategic impact in the first sentence.
- Each EXPERIENCE entry must open with a scope line (team size, budget managed, or revenue influenced) before the bullets.
- Surface 2 "signature achievements" per role — results so strong they make the reader pause.
- Keep section order: CONTACT, SUMMARY, CORE COMPETENCIES, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS.`;

    case "technical":
    case "technical-ats":
      return `
TEMPLATE STYLE: Technical
- Tone: precise, results-oriented, technically credible.
- CORE COMPETENCIES section must appear immediately after SUMMARY and must include all technical tools, languages, frameworks, platforms, and methodologies mentioned in the resume or job description.
- EXPERIENCE bullets should follow the formula: [Action verb] + [Tech/tool used] + [Quantified outcome].
- Include a PROJECTS section if any relevant projects exist — format as: Project Name: 1-line description with outcome or GitHub link.
- Keep section order: CONTACT, SUMMARY, CORE COMPETENCIES, SKILLS, EXPERIENCE, PROJECTS, EDUCATION, CERTIFICATIONS.`;

    case "entry":
    case "entry-2col":
      return `
TEMPLATE STYLE: Entry Level / New Graduate
- Tone: enthusiastic but professional. Emphasizes potential, learning agility, and transferable skills.
- Move EDUCATION to appear directly after SUMMARY and before EXPERIENCE.
- Emphasize internships, class projects, volunteer work, and extracurriculars if full-time experience is limited.
- CORE COMPETENCIES should list transferable skills and any tech tools learned in coursework or projects.
- Summary: 2-3 lines focusing on degree, area of study, and the type of role the candidate is targeting.
- Keep section order: CONTACT, SUMMARY, EDUCATION, CORE COMPETENCIES, SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS.`;

    default:
      return "";
  }
}
