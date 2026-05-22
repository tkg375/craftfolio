"use client";
import Link from "next/link";

function downloadTextAsPdf(text: string, filename: string, serif = false) {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginX = 72, marginY = 72;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - marginX * 2;
    let y = marginY;
    doc.setFont(serif ? "times" : "helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    text.split("\n").forEach(line => {
      const wrapped = doc.splitTextToSize(line || " ", maxWidth);
      wrapped.forEach((wl: string) => {
        if (y > pageHeight - marginY) { doc.addPage(); y = marginY; }
        doc.text(wl, marginX, y);
        y += 16;
      });
    });
    doc.save(filename);
  });
}

function downloadAnalysisAsPdf(a: ResumeResult) {
  import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const mx = 50, pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
    const mw = pw - mx * 2;
    let y = 50;

    const line = (text: string, size = 11, bold = false, color: [number,number,number] = [30,41,59]) => {
      if (y > ph - 50) { doc.addPage(); y = 50; }
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(text, mw);
      wrapped.forEach((wl: string) => { doc.text(wl, mx, y); y += size * 1.4; });
    };

    const gap = (n = 8) => { y += n; };

    line("Resume Analysis — Craftfolio", 18, true, [124,58,237]);
    gap(12);

    line(`Overall: ${a.overallScore}  ATS: ${a.atsScore}  Keywords: ${a.keywordMatch}  Impact: ${a.impactScore}`, 12, true);
    gap(6);
    line(a.summary, 11, false, [71,85,105]);
    gap(14);

    line("STRENGTHS", 10, true, [124,58,237]); gap(4);
    a.strengths.forEach(s => { line(`• ${s.point}`, 11, true); line(`  ${s.explanation}`, 10, false, [71,85,105]); gap(4); });
    gap(10);

    line("WEAKNESSES", 10, true, [124,58,237]); gap(4);
    a.weaknesses.forEach(w => { line(`• ${w.point}`, 11, true); line(`  ${w.explanation}`, 10, false, [71,85,105]); gap(4); });
    gap(10);

    line("SUGGESTIONS", 10, true, [124,58,237]); gap(4);
    a.suggestions.forEach(s => { line(`[${s.priority.toUpperCase()}] ${s.action}`, 11, true); line(`  ${s.explanation}`, 10, false, [71,85,105]); gap(4); });

    doc.save("resume-analysis.pdf");
  });
}

type ResumeResult = {
  overallScore: number; atsScore: number; keywordMatch: number; impactScore: number;
  foundKeywords: string[]; missingKeywords: string[];
  strengths: { point: string; explanation: string }[];
  weaknesses: { point: string; explanation: string }[];
  suggestions: { action: string; priority: string; explanation: string }[];
  summary: string;
};

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36, cx = 48, cy = 48;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)" />
        <text x="48" y="52" textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="700">{score}</text>
      </svg>
      <span className="text-xs text-slate-400 mt-1 font-medium">{label}</span>
    </div>
  );
}

export default function AnalysisViewer({
  type, result, createdAt,
}: {
  type: string;
  result: unknown;
  createdAt: string;
}) {
  const date = new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5"
        style={{ background: "rgba(8,8,15,0.90)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", overflow: "visible" }}>
        <Link href="/" style={{ overflow: "visible" }}>
          <span style={{ fontFamily: "AmbarPearl", fontSize: "2rem", color: "#a78bfa", lineHeight: 1.4, display: "block", paddingTop: "4px" }}>Craftfolio</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="mb-6">
          <p className="text-xs font-semibold mb-1" suppressHydrationWarning style={{ color: "var(--text-muted)" }}>{date}</p>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            {{
              resume: "ATS Analysis",
              resume_job: "Job Match Analysis",
              resume_rewrite: "Resume Rewrite",
              "resume-rewrite": "Resume Rewrite",
              career_pivot: "Career Pivot",
              cover_letter: "Cover Letter",
              "cover-letter": "Cover Letter",
            }[type] ?? "Analysis"}
          </h1>
        </div>

        {/* Resume analysis */}
        {type === "resume" && (() => {
          const a = result as ResumeResult;
          return (
            <div className="space-y-6">
              <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-slate-100 text-lg">Scores</h2>
                  <button onClick={() => downloadAnalysisAsPdf(a)}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.30)", color: "#a78bfa" }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                    Download PDF
                  </button>
                </div>
                <div className="flex justify-around flex-wrap gap-6">
                  <ScoreCircle score={a.overallScore} label="Overall" color="#7C3AED" />
                  <ScoreCircle score={a.atsScore} label="ATS Score" color="#4F46E5" />
                  <ScoreCircle score={a.keywordMatch} label="Keyword Match" color="#059669" />
                  <ScoreCircle score={a.impactScore} label="Impact Score" color="#7c3aed" />
                </div>
                <p className="text-slate-400 text-sm mt-6 text-center leading-relaxed">{a.summary}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h2 className="font-bold text-slate-100 mb-3">Keywords Found</h2>
                  <div className="flex flex-wrap gap-2">
                    {a.foundKeywords.filter(k => k.length <= 60).map((kw, i) => (
                      <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-semibold">{kw}</span>
                    ))}
                    {a.foundKeywords.length === 0 && <p className="text-sm text-slate-400">None matched</p>}
                  </div>
                </div>
                <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h2 className="font-bold text-slate-100 mb-3">Missing Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {a.missingKeywords.filter(k => k.length <= 60).map((kw, i) => (
                      <span key={i} className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full font-semibold">{kw}</span>
                    ))}
                    {a.missingKeywords.length === 0 && <p className="text-sm text-slate-400">None missing</p>}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h2 className="font-bold text-slate-100 mb-4">Strengths</h2>
                  <div className="space-y-3">
                    {a.strengths.map((s, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-green-500 mt-0.5 flex-shrink-0"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{s.point}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h2 className="font-bold text-slate-100 mb-4">Weaknesses</h2>
                  <div className="space-y-3">
                    {a.weaknesses.map((w, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-violet-400 mt-0.5 flex-shrink-0"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{w.point}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{w.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {a.suggestions?.length > 0 && (
                <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h2 className="font-bold text-slate-100 mb-4">Suggestions</h2>
                  <div className="space-y-3">
                    {a.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          s.priority === "high" ? "bg-red-500/20 text-red-400" :
                          s.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>{s.priority}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{s.action}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{s.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Resume rewrite */}
        {type === "resume_rewrite" && (() => {
          const r = result as { rewritten: string };
          return (
            <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => navigator.clipboard.writeText(r.rewritten)}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy
                </button>
                <button onClick={() => downloadTextAsPdf(r.rewritten, "resume-rewrite.pdf")}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.30)", color: "#a78bfa" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                  Download PDF
                </button>
              </div>
              <div className="rounded-xl p-6 overflow-auto max-h-[600px] text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: "#ffffff", color: "#1e293b", border: "1px solid rgba(0,0,0,0.10)" }}>
                {r.rewritten}
              </div>
            </div>
          );
        })()}

        {/* Cover letter */}
        {type === "cover_letter" && (() => {
          const r = result as { coverLetter: string };
          return (
            <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex justify-end gap-2 mb-4">
                <button onClick={() => navigator.clipboard.writeText(r.coverLetter)}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy
                </button>
                <button onClick={() => downloadTextAsPdf(r.coverLetter, "cover-letter.pdf", true)}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.30)", color: "#a78bfa" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/></svg>
                  Download PDF
                </button>
              </div>
              <div className="rounded-xl p-6 overflow-auto max-h-[600px] text-sm leading-relaxed whitespace-pre-wrap"
                style={{ background: "#ffffff", color: "#1e293b", border: "1px solid rgba(0,0,0,0.10)", fontFamily: "Georgia, serif" }}>
                {r.coverLetter}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
