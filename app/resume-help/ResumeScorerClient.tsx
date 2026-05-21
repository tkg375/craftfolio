"use client";

import { useState, useRef } from "react";
import type { ResumeAnalysis } from "@/lib/gemini";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import type { ResumeTemplate } from "@/lib/resume-templates";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/components/AuthModal";
import BuyAnalysisButton from "@/components/BuyAnalysisButton";

type Mode = "score" | "job" | "pivot" | "careers";

function exportResumePdf(resumeText: string, template: ResumeTemplate) {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = template.id === "executive" ? 54 : 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginX * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 0;

    if (template.id === "modern") {
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 8, "F");
      y = 28;
    } else if (template.id === "executive") {
      doc.setFillColor(29, 78, 216);
      doc.rect(0, 0, pageWidth, 6, "F");
      y = 26;
    } else {
      y = 50;
    }

    const accentRgb: Record<string, [number, number, number]> = {
      classic:   [30, 41, 59],
      modern:    [220, 38, 38],
      executive: [29, 78, 216],
      technical: [5, 150, 105],
      entry:     [124, 58, 237],
    };
    const [ar, ag, ab] = accentRgb[template.id] ?? [30, 41, 59];

    const lines = resumeText.split("\n");
    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (y > pageHeight - 50) { doc.addPage(); y = 50; }
      if (!line) { y += 6; return; }

      const isSectionHeader = /^[A-Z][A-Z\s&\/\-]{2,}$/.test(line);
      const isBullet = line.startsWith("•");

      if (idx === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(template.id === "executive" ? 20 : 18);
        doc.setTextColor(15, 23, 42);
        doc.text(line, pageWidth / 2, y, { align: "center" });
        y += template.id === "executive" ? 26 : 22;
      } else if (isSectionHeader) {
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(ar, ag, ab);
        doc.text(line, marginX, y);
        y += 3;
        doc.setDrawColor(ar, ag, ab);
        doc.setLineWidth(template.id === "executive" ? 1.5 : 0.75);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 11;
        doc.setTextColor(15, 23, 42);
        doc.setLineWidth(0.5);
      } else if (isBullet) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const wrapped = doc.splitTextToSize(line, maxWidth - 10);
        wrapped.forEach((wl: string, wi: number) => {
          if (y > pageHeight - 50) { doc.addPage(); y = 50; }
          doc.text(wl, marginX + (wi === 0 ? 0 : 10), y);
          y += 14;
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const wrapped = doc.splitTextToSize(line, maxWidth);
        wrapped.forEach((wl: string) => {
          if (y > pageHeight - 50) { doc.addPage(); y = 50; }
          doc.text(wl, marginX, y);
          y += 14;
        });
      }
    });

    const url = doc.output("bloburl");
    window.open(url as unknown as string, "_blank");
  });
}

function ResumePreview({ text, template }: { text: string; template: ResumeTemplate }) {
  const lines = text.split("\n");
  let currentSection = "";
  const hex = template.accentHex.replace("#", "");
  const [pr, pg, pb] = [0, 2, 4].map(o => parseInt(hex.slice(o, o + 2), 16));
  const luminance = 0.299 * pr + 0.587 * pg + 0.114 * pb;
  const accentColor = luminance > 180 ? "#1e293b" : template.accentHex;

  return (
    <div className="rounded-xl p-6 overflow-auto max-h-[600px] text-sm leading-relaxed space-y-1" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.10)", color: "#1e293b" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        const isSectionHeader = /^[A-Z][A-Z\s&\/\-]{2,}$/.test(trimmed);
        if (isSectionHeader) {
          currentSection = trimmed;
          return (
            <p key={i} className="font-bold text-xs tracking-widest uppercase mt-4 mb-1 pb-1"
              style={{ color: accentColor, borderBottom: `1px solid ${accentColor}22` }}>
              {trimmed}
            </p>
          );
        }
        if (trimmed.startsWith("•")) return <p key={i} className="pl-4" style={{ color: "#334155" }}>{trimmed}</p>;
        if (i === 0) return <p key={i} className="text-lg font-bold text-center" style={{ color: "#0f172a" }}>{trimmed}</p>;
        if (i === 1) return <p key={i} className="text-xs text-center mb-1" style={{ color: "#475569" }}>{trimmed}</p>;
        const prevTrimmed = lines.slice(0, i).reverse().find(l => l.trim())?.trim() ?? "";
        const prevIsBullet = prevTrimmed.startsWith("•");
        const prevIsHeader = /^[A-Z][A-Z\s&\/\-]{2,}$/.test(prevTrimmed);
        if (currentSection === "PROJECTS" || currentSection === "CERTIFICATIONS") {
          return <p key={i} className={`font-semibold ${prevIsHeader ? "" : "mt-3"}`} style={{ color: "#0f172a" }}>{trimmed}</p>;
        }
        if (currentSection === "EXPERIENCE" && !prevIsHeader && !prevIsBullet) {
          return <p key={i} className="font-semibold mt-3" style={{ color: "#0f172a" }}>{trimmed}</p>;
        }
        return <p key={i} style={{ color: "#334155" }}>{trimmed}</p>;
      })}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  const steps = ["Upload Resume", "Choose Goal", "Results"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? "bg-green-500 text-white" : active ? "text-white" : "bg-white/10 text-slate-500"
              }`} style={active ? { background: "linear-gradient(135deg, #5b21b6, #7c3aed)" } : {}}>
                {done ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                ) : num}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? "text-slate-100" : done ? "text-green-600" : "text-slate-500"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-px mb-5 mx-1 transition-all ${done ? "bg-green-500" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ResumeScorerClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<Mode | null>(null);
  const [openPanel, setOpenPanel] = useState<"resume" | "cover" | "careers" | null>(null);

  // Resume
  const [resumeText, setResumeText] = useState("");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumePdfBase64, setResumePdfBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Job URL
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showPasteFallback, setShowPasteFallback] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [urlFetched, setUrlFetched] = useState(false);

  // Career pivot
  const [targetProfession, setTargetProfession] = useState("");
  const [pivoting, setPivoting] = useState(false);
  const [pivotResume, setPivotResume] = useState<string | null>(null);
  const [pivotError, setPivotError] = useState<string | null>(null);
  const [pivotCopied, setPivotCopied] = useState(false);
  const [pivotingCareerTitle, setPivotingCareerTitle] = useState<string | null>(null);
  const pivotResultRef = useRef<HTMLDivElement>(null);

  // Analysis
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scoresRef = useRef<HTMLDivElement>(null);

  // Rewrite
  const [rewriting, setRewriting] = useState(false);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(RESUME_TEMPLATES[0]);

  // Cover letter
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverCopied, setCoverCopied] = useState(false);

  const pathname = usePathname();
  const { openModal } = useAuthModal();

  const hasResume = !!(resumeText.trim() || resumePdfBase64);

  function handleFile(file: File) {
    if (file.type !== "application/pdf") { setError("Only PDF files are supported."); return; }
    setFileName(file.name);
    setResumeText("");
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setResumePdfBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleFetchJobUrl() {
    const trimmed = jobUrl.trim();
    if (!trimmed) return;
    setFetchingUrl(true);
    setUrlFetchError(null);
    setShowPasteFallback(false);
    setUrlFetched(false);
    setJobDescription("");
    try {
      const res = await fetch("/api/analyze/fetch-job-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json() as { error?: string; needsPaste?: boolean; text?: string };
      if (!res.ok || data.needsPaste) {
        setUrlFetchError(data.error || "Could not read the job page.");
        setShowPasteFallback(true);
        return;
      }
      setJobDescription(data.text ?? "");
      setUrlFetched(true);
    } catch {
      setUrlFetchError("Could not fetch the job page. Please paste the description below.");
      setShowPasteFallback(true);
    } finally {
      setFetchingUrl(false);
    }
  }

  async function handleAnalyze() {
    if (!hasResume) return;
    if (!isLoggedIn) { openModal("register", pathname); return; }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || undefined,
          jobDescription: jobDescription || undefined,
          resumePdfBase64: resumePdfBase64 || undefined,
          mode,
        }),
      });
      const data = await res.json() as { error?: string; analysis?: ResumeAnalysis };
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setAnalysis(data.analysis ?? null);
      setImprovedResume(null);
      setStep(3);
      setTimeout(() => scoresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCareerPivot(overrideTitle?: string) {
    const profession = overrideTitle ?? targetProfession.trim();
    if (!profession || !hasResume) return;
    if (!isLoggedIn) { openModal("register", pathname); return; }
    setPivoting(true);
    setPivotError(null);
    setPivotResume(null);
    setPivotingCareerTitle(profession);
    try {
      const res = await fetch("/api/analyze/resume-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResume: resumeText || undefined,
          resumePdfBase64: resumePdfBase64 || undefined,
          analysis: analysis ?? { overallScore: 0, atsScore: 0, impactScore: 0, clarityScore: 0, missingKeywords: [], weaknesses: [], suggestions: [] },
          targetProfession: profession,
          templateId: selectedTemplate.id,
        }),
      });
      const data = await res.json() as { error?: string; rewritten?: string };
      if (!res.ok) { setPivotError(data.error || "Something went wrong."); return; }
      setPivotResume(data.rewritten ?? null);
      setStep(3);
      setTimeout(() => pivotResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setPivotError("Something went wrong. Please try again.");
    } finally {
      setPivoting(false);
    }
  }

  async function handleRewrite(template: ResumeTemplate) {
    if (!analysis) return;
    setShowTemplatePicker(false);
    setRewriting(true);
    setRewriteError(null);
    setImprovedResume(null);
    try {
      const res = await fetch("/api/analyze/resume-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResume: resumeText || undefined,
          resumePdfBase64: resumePdfBase64 || undefined,
          analysis,
          jobDescription: jobDescription || undefined,
          templateId: template.id,
        }),
      });
      const data = await res.json() as { error?: string; rewritten?: string };
      if (!res.ok) { setRewriteError(data.error || "Something went wrong."); return; }
      setImprovedResume(data.rewritten ?? null);
    } catch {
      setRewriteError("Something went wrong. Please try again.");
    } finally {
      setRewriting(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (!jobDescription.trim()) {
      setCoverError("A job description is required to generate a cover letter.");
      return;
    }
    setGeneratingCover(true);
    setCoverError(null);
    setCoverLetter(null);
    try {
      const res = await fetch("/api/analyze/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || undefined,
          resumePdfBase64: resumePdfBase64 || undefined,
          jobDescription,
        }),
      });
      const data = await res.json() as { error?: string; coverLetter?: string };
      if (!res.ok) { setCoverError(data.error || "Something went wrong."); return; }
      setCoverLetter(data.coverLetter ?? null);
    } catch {
      setCoverError("Something went wrong. Please try again.");
    } finally {
      setGeneratingCover(false);
    }
  }

  function exportCoverLetterPdf(text: string) {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const marginX = 72, marginY = 72;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - marginX * 2;
      let y = marginY;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      const paragraphs = text.split(/\n\n+/);
      paragraphs.forEach((para, pIdx) => {
        const lines = doc.splitTextToSize(para.trim(), maxWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - marginY) { doc.addPage(); y = marginY; }
          doc.text(line, marginX, y);
          y += 16;
        });
        if (pIdx < paragraphs.length - 1) y += 10;
      });
      const url = doc.output("bloburl");
      window.open(url as unknown as string, "_blank");
    });
  }

  function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return (
      <div className="flex flex-col items-center">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8"/>
          <circle cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <text x="48" y="52" textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="700">{score}</text>
        </svg>
        <span className="text-xs text-slate-400 mt-1 font-medium">{label}</span>
      </div>
    );
  }

  // ── Step 1: Upload resume ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <StepIndicator step={1} />

        <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Upload your resume</h2>
            <p className="text-sm text-slate-400">We&apos;ll use this for every tool in the next step.</p>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-violet-400 bg-violet-400/10" : "border-slate-600 hover:border-slate-400"
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="text-violet-400/70 mx-auto mb-3">
              <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            {fileName ? (
              <p className="text-sm font-semibold text-violet-400">{fileName}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-400">Drop your PDF resume here or click to upload</p>
                <p className="text-xs text-slate-500 mt-1">PDF files up to 10MB</p>
              </>
            )}
          </div>

          {/* Paste toggle */}
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="flex-1 h-px bg-white/10" />
            <button type="button" onClick={() => setShowPasteBox(v => !v)}
              className="hover:text-slate-100 transition-colors underline underline-offset-2 decoration-dotted">
              or click here to paste text
            </button>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {showPasteBox && (
            <textarea
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); setFileName(null); setResumePdfBase64(null); }}
              placeholder="Paste your resume text here..."
              rows={8}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder-slate-500"
              style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          )}

          {error && (
            <p className="text-violet-400 text-sm">{error}</p>
          )}

          <button
            onClick={() => { if (hasResume) setStep(2); }}
            disabled={!hasResume}
            className="w-full font-semibold py-3.5 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
          >
            Continue
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Choose goal ───────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div>
        <StepIndicator step={2} />

        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-100">What would you like to do?</h2>
            <p className="text-sm text-slate-400 mt-1">Pick one — you can always come back and try the others.</p>
          </div>

          {/* Mode cards */}
          <div className="grid gap-3">
            {/* Score my resume */}
            <button
              onClick={() => setMode("score")}
              className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                mode === "score" ? "border-violet-500" : "border-transparent"
              }`}
              style={{ background: "var(--bg-alt)", ...(mode === "score" ? { boxShadow: "0 0 0 1px #7c3aed" } : {}) }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-100">Score &amp; analyze my resume</p>
                  <p className="text-sm text-slate-400 mt-0.5">Get ATS, keyword, impact, and overall scores plus actionable suggestions.</p>
                </div>
                {mode === "score" && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Match to a job */}
            <button
              onClick={() => setMode("job")}
              className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                mode === "job" ? "border-violet-500" : "border-transparent"
              }`}
              style={{ background: "var(--bg-alt)", ...(mode === "job" ? { boxShadow: "0 0 0 1px #7c3aed" } : {}) }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-100">Match to a specific job</p>
                  <p className="text-sm text-slate-400 mt-0.5">Paste a job URL and we&apos;ll score your resume against that posting, highlight gaps, and generate a tailored cover letter.</p>
                </div>
                {mode === "job" && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Career pivot */}
            <button
              onClick={() => setMode("pivot")}
              className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                mode === "pivot" ? "border-violet-500" : "border-transparent"
              }`}
              style={{ background: "var(--bg-alt)", ...(mode === "pivot" ? { boxShadow: "0 0 0 1px #7c3aed" } : {}) }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-100">Pivot my career</p>
                  <p className="text-sm text-slate-400 mt-0.5">Switching industries or roles? We&apos;ll rewrite your resume to target a completely different career.</p>
                </div>
                {mode === "pivot" && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Explore career options */}
            <button
              onClick={() => setMode("careers")}
              className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                mode === "careers" ? "border-violet-500" : "border-transparent"
              }`}
              style={{ background: "var(--bg-alt)", ...(mode === "careers" ? { boxShadow: "0 0 0 1px #7c3aed" } : {}) }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-100">Explore career options</p>
                  <p className="text-sm text-slate-400 mt-0.5">Not sure what&apos;s next? AI will analyze your resume and suggest the best roles for your background.</p>
                </div>
                {mode === "careers" && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Mode-specific inputs */}
          {mode === "job" && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              <label className="block text-sm font-semibold text-slate-400">Job Posting URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={jobUrl}
                  onChange={e => { setJobUrl(e.target.value); setUrlFetched(false); setShowPasteFallback(false); setUrlFetchError(null); setJobDescription(""); }}
                  placeholder="https://jobs.example.com/software-engineer"
                  className="flex-1 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-500"
                  style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}
                />
                <button
                  type="button"
                  onClick={handleFetchJobUrl}
                  disabled={fetchingUrl || !jobUrl.trim()}
                  className="px-4 py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
                >
                  {fetchingUrl ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Fetching...</>
                  ) : urlFetched ? (
                    <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-green-300"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Fetched</>
                  ) : "Fetch Job"}
                </button>
              </div>
              {urlFetchError && <p className="text-xs text-violet-400">{urlFetchError}</p>}
              {urlFetched && <p className="text-xs text-green-400">Job description loaded successfully.</p>}
              {showPasteFallback && (
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Open the job posting, select all text, copy, and paste it here..."
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder-slate-500"
                  style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}
                />
              )}
            </div>
          )}

          {mode === "pivot" && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              <label className="block text-sm font-semibold text-slate-400">What career do you want to pivot to?</label>
              <input
                type="text"
                value={targetProfession}
                onChange={e => { setTargetProfession(e.target.value); setPivotResume(null); setPivotError(null); }}
                placeholder="e.g. Software Engineer, Project Manager, Nurse, Sales Rep..."
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-500"
                style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}
              />
            </div>
          )}

          {/* Action row */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl font-semibold text-sm text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-2"
              style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>

            {mode === "score" && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 font-semibold py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
              >
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
                ) : (
                  <>Analyze My Resume <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">1 credit</span></>
                )}
              </button>
            )}

            {mode === "job" && (
              <button
                onClick={handleAnalyze}
                disabled={loading || (!urlFetched && !jobDescription.trim())}
                className="flex-1 font-semibold py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
              >
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
                ) : (
                  <>Match to This Job <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">1 credit</span></>
                )}
              </button>
            )}

            {mode === "pivot" && (
              <button
                onClick={() => { void handleCareerPivot(); }}
                disabled={pivoting || !targetProfession.trim()}
                className="flex-1 font-semibold py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
              >
                {pivoting ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Rewriting...</>
                ) : (
                  <>Pivot My Resume <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">1 credit</span></>
                )}
              </button>
            )}

            {mode === "careers" && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 font-semibold py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
              >
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
                ) : (
                  <>Explore My Options <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">1 credit</span></>
                )}
              </button>
            )}

            {!mode && (
              <div className="flex-1 py-3 rounded-xl text-center text-sm text-slate-500 font-medium" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                Select an option above to continue
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl text-violet-400 text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
              {error}
              {(error.includes("sign in") || error.includes("Sign up")) && (
                <Link href={`/register?redirect=${encodeURIComponent(pathname)}`} className="mt-2 inline-block font-semibold underline">Create free account</Link>
              )}
              {error.includes("Buy") && <BuyAnalysisButton returnUrl={pathname} />}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 3: Results ───────────────────────────────────────────────────────
  return (
    <div>
      <StepIndicator step={3} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-100 text-xl">
          {mode === "pivot" ? "Career Pivot Results" : mode === "careers" ? "Career Options" : "Your Resume Analysis"}
        </h2>
        <button
          onClick={() => { setStep(2); setAnalysis(null); setPivotResume(null); setImprovedResume(null); setCoverLetter(null); }}
          className="text-sm font-medium text-slate-400 hover:text-slate-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Pivot result */}
        {pivotResume && (
          <div ref={pivotResultRef} className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <p className="text-sm font-semibold text-slate-100">Resume pivoted to: <span className="text-violet-400">{pivotingCareerTitle ?? targetProfession}</span></p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(pivotResume); setPivotCopied(true); setTimeout(() => setPivotCopied(false), 2000); }}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {pivotCopied ? <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-green-500"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</> : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>}
                </button>
                <button
                  onClick={() => exportResumePdf(pivotResume, selectedTemplate)}
                  className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors"
                  style={{ background: selectedTemplate.accentHex }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                  Download PDF
                </button>
              </div>
            </div>
            <ResumePreview text={pivotResume} template={selectedTemplate} />
            {pivotError && <p className="text-violet-400 text-sm mt-3">{pivotError}</p>}
          </div>
        )}

        {/* Score results */}
        {analysis && (
          <>
            <div ref={scoresRef} className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              <h2 className="font-bold text-slate-100 mb-6 text-lg">Your Scores</h2>
              <div className="flex justify-around flex-wrap gap-6">
                <ScoreCircle score={analysis.overallScore} label="Overall Score" color="#7C3AED" />
                <ScoreCircle score={analysis.atsScore} label="ATS Score" color="#4F46E5" />
                <ScoreCircle score={analysis.keywordMatch} label="Keyword Match" color="#059669" />
                <ScoreCircle score={analysis.impactScore} label="Impact Score" color="#7c3aed" />
              </div>
              <p className="text-slate-400 text-sm mt-6 text-center leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                <h2 className="font-bold text-slate-100 mb-3 text-base">Keywords Found</h2>
                <div className="flex flex-wrap gap-2">
                  {analysis.foundKeywords.filter(kw => kw.length <= 60).map((kw, i) => (
                    <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-extrabold">{kw}</span>
                  ))}
                  {analysis.foundKeywords.length === 0 && <p className="text-sm text-slate-400">No keywords matched</p>}
                </div>
              </div>
              <div className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                <h2 className="font-bold text-slate-100 mb-3 text-base">Missing Keywords</h2>
                {(() => {
                  const pills = analysis.missingKeywords.filter(kw => kw.length <= 60);
                  const notes = analysis.missingKeywords.filter(kw => kw.length > 60);
                  return (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {pills.map((kw, i) => <span key={i} className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full font-extrabold">{kw}</span>)}
                        {pills.length === 0 && notes.length === 0 && <p className="text-sm text-slate-400">No missing keywords</p>}
                      </div>
                      {notes.map((note, i) => <p key={i} className="text-xs text-slate-400 mt-3 leading-relaxed">{note}</p>)}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                <h2 className="font-bold text-slate-100 mb-4 text-base">Strengths</h2>
                <div className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-green-500 mt-0.5 flex-shrink-0"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <div>
                        <p className="text-sm font-semibold text-slate-400">{s.point}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                <h2 className="font-bold text-slate-100 mb-4 text-base">Weaknesses</h2>
                <div className="space-y-3">
                  {analysis.weaknesses.map((w, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-violet-500 mt-0.5 flex-shrink-0"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      <div>
                        <p className="text-sm font-semibold text-slate-400">{w.point}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{w.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
              <h2 className="font-bold text-slate-100 mb-4 text-lg">Improvement Suggestions</h2>
              <div className="divide-y divide-white/10">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full capitalize mb-1.5 ${
                      s.priority === "high" ? "bg-violet-600/20 text-violet-400" : s.priority === "medium" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-600"
                    }`}>{s.priority}</span>
                    <p className="text-sm font-semibold text-slate-400">{s.action}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

                {/* ── Expandable action panels ── */}
            <div className="space-y-3 pt-2">

              {/* Generate New Resume */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={() => setOpenPanel(openPanel === "resume" ? null : "resume")}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-90 transition-opacity"
                  style={{ background: "var(--bg-alt)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm">Generate New Resume</p>
                      <p className="text-xs text-slate-400">Fully rewritten with every suggestion applied</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {improvedResume && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Ready</span>}
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className={`text-slate-500 transition-transform ${openPanel === "resume" ? "rotate-180" : ""}`}><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>
                {openPanel === "resume" && (
                  <div className="px-5 pb-5 pt-1" style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border-subtle)" }}>
                    {!improvedResume ? (
                      <button
                        onClick={() => setShowTemplatePicker(true)}
                        disabled={rewriting}
                        className="mt-3 w-full sm:w-auto font-semibold px-6 py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
                      >
                        {rewriting ? (
                          <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</>
                        ) : (
                          <>Choose Template &amp; Generate <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">1 credit</span></>
                        )}
                      </button>
                    ) : (
                      <div className="mt-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-100">Your new resume is ready</p>
                            <p className="text-xs text-slate-400 mt-0.5">Template: {selectedTemplate.name}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { navigator.clipboard.writeText(improvedResume); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 px-3 py-1.5 rounded-lg transition-colors" style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}>
                              {copied ? <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-green-500"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</> : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>}
                            </button>
                            <button onClick={() => exportResumePdf(improvedResume!, selectedTemplate)}
                              className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors" style={{ background: selectedTemplate.accentHex }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                              Download PDF
                            </button>
                            <button onClick={() => { setImprovedResume(null); setShowTemplatePicker(true); }} className="text-sm font-medium text-slate-400 px-3 py-1.5">Change Template</button>
                          </div>
                        </div>
                        <ResumePreview text={improvedResume} template={selectedTemplate} />
                      </div>
                    )}
                    {rewriteError && <p className="text-violet-400 text-sm mt-3">{rewriteError}</p>}
                  </div>
                )}
              </div>

              {/* Generate Cover Letter */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={() => setOpenPanel(openPanel === "cover" ? null : "cover")}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-90 transition-opacity"
                  style={{ background: "var(--bg-alt)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-violet-500"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm">Generate Cover Letter</p>
                      <p className="text-xs text-slate-400">Tailored to this job and your resume</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {coverLetter && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Ready</span>}
                    {!jobDescription.trim() && mode !== "job" && <span className="text-xs text-slate-500">needs job URL</span>}
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className={`text-slate-500 transition-transform ${openPanel === "cover" ? "rotate-180" : ""}`}><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>
                {openPanel === "cover" && (
                  <div className="px-5 pb-5 pt-1" style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border-subtle)" }}>
                    {!coverLetter ? (
                      <>
                        {!jobDescription.trim() && (
                          <p className="mt-3 text-xs text-amber-700 rounded-lg px-3 py-2" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                            Go back to Step 2 and fetch a job URL to generate a tailored cover letter.
                          </p>
                        )}
                        <button
                          onClick={handleGenerateCoverLetter}
                          disabled={generatingCover}
                          className="mt-3 w-full sm:w-auto font-semibold px-6 py-3 rounded-xl text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
                          style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
                        >
                          {generatingCover ? (
                            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Writing...</>
                          ) : (
                            <>Generate Cover Letter <span className="text-xs bg-blue-400 text-slate-100 px-2 py-0.5 rounded-full font-medium">1 credit</span></>
                          )}
                        </button>
                        {coverError && <p className="text-violet-400 text-sm mt-3">{coverError}</p>}
                      </>
                    ) : (
                      <div className="mt-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <p className="text-sm font-semibold text-slate-100">Your cover letter is ready</p>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => { navigator.clipboard.writeText(coverLetter); setCoverCopied(true); setTimeout(() => setCoverCopied(false), 2000); }}
                              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 px-3 py-1.5 rounded-lg transition-colors" style={{ background: "var(--border-subtle)", border: "1px solid rgba(0,0,0,0.08)" }}>
                              {coverCopied ? <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-green-500"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied!</> : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>Copy</>}
                            </button>
                            <button onClick={() => exportCoverLetterPdf(coverLetter!)}
                              className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7c3aed" }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                              Download PDF
                            </button>
                            <button onClick={() => setCoverLetter(null)} className="text-sm font-medium text-slate-400 px-3 py-1.5">Regenerate</button>
                          </div>
                        </div>
                        <div className="rounded-xl p-5 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-serif" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border-subtle)" }}>
                          {coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Career Options — shown inline when mode is "careers" */}
            {mode === "careers" && analysis.careerOptions && analysis.careerOptions.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[...analysis.careerOptions].sort((a, b) => {
                  const order = { strong: 0, good: 1, stretch: 2 };
                  return (order[a.fit] ?? 3) - (order[b.fit] ?? 3);
                }).map((opt, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-100 text-sm leading-snug">{opt.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        opt.fit === "strong" ? "bg-green-100 text-green-700" : opt.fit === "good" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {opt.fit === "strong" ? "Strong fit" : opt.fit === "good" ? "Good fit" : "Stretch"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{opt.why}</p>
                    {opt.keywordsToAdd.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">Add to resume:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {opt.keywordsToAdd.map((kw, j) => (
                            <span key={j} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { void handleCareerPivot(opt.title); }}
                      disabled={pivoting}
                      className="w-full mt-1 text-xs font-semibold py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)" }}
                    >
                      {pivoting && pivotingCareerTitle === opt.title ? (
                        <><svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</>
                      ) : <>Pivot Resume to This Role <span className="opacity-70">· 1 credit</span></>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowTemplatePicker(false); }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: "var(--bg-secondary)" }}>
            <div className="sticky top-0 rounded-t-2xl px-6 pt-6 pb-4 flex items-center justify-between" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Choose a Resume Template</h2>
                <p className="text-sm text-slate-400 mt-0.5">All templates are ATS-safe and HR-compliant.</p>
              </div>
              <button onClick={() => setShowTemplatePicker(false)} className="text-slate-400 hover:text-slate-100 transition">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              {RESUME_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelectedTemplate(t)}
                  className="w-full text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md"
                  style={{ borderColor: selectedTemplate.id === t.id ? t.accentHex : "rgba(0,0,0,0.08)", boxShadow: selectedTemplate.id === t.id ? `0 0 0 3px ${t.accentHex}22` : undefined }}>
                  <div className="relative h-28 overflow-hidden bg-white" style={{ fontFamily: "serif" }}>
                    {(t.id === "modern" || t.id === "executive") && <div className="absolute top-0 left-0 right-0 h-2" style={{ background: t.accentHex }} />}
                    {t.id === "classic" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-800" />}
                    {t.id === "technical" && <div className="absolute top-0 left-0 w-1 bottom-0" style={{ background: t.accentHex }} />}
                    {t.id === "entry" && <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t" style={{ background: `linear-gradient(90deg, ${t.accentHex}, ${t.accentHex}88)` }} />}
                    <div className={`px-4 ${(t.id === "modern" || t.id === "executive") ? "pt-3.5" : t.id === "technical" ? "pl-5 pt-3" : "pt-3"}`}>
                      <div className="text-center mb-1">
                        <div className="h-2 w-24 rounded mx-auto mb-0.5" style={{ background: t.id === "executive" ? "#1e293b" : "#334155" }} />
                        <div className="h-1 w-16 rounded mx-auto bg-slate-200" />
                      </div>
                      <div className="mt-2 mb-1 flex items-center gap-1">
                        <div className="h-1 w-12 rounded" style={{ background: t.accentHex }} />
                        <div className="flex-1 h-px" style={{ background: `${t.accentHex}44` }} />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 w-full rounded bg-slate-100" />
                        <div className="h-1 w-5/6 rounded bg-slate-100" />
                      </div>
                    </div>
                    {selectedTemplate.id === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${t.accentHex}18` }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg" style={{ background: t.accentHex }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(0,0,0,0.06)", background: selectedTemplate.id === t.id ? `${t.accentHex}18` : "rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-sm text-slate-100">{t.name}</span>
                      {selectedTemplate.id === t.id && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-slate-100" style={{ background: t.accentHex }}>✓ Selected</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{t.tagline}</p>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: t.accentHex }}>{t.bestFor}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="sticky bottom-0 rounded-b-2xl px-6 pb-6 pt-4" style={{ background: "var(--bg-secondary)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <button onClick={() => handleRewrite(selectedTemplate)} disabled={!hasResume}
                className="w-full font-bold py-3.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${selectedTemplate.accentHex}cc, ${selectedTemplate.accentHex})` }}>
                Generate with {selectedTemplate.name} →
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">Uses 1 credit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
