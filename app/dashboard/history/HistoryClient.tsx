"use client";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  resume: "ATS Analysis",
  resume_job: "Job Match Analysis",
  resume_rewrite: "Full Rewrite",
  "resume-rewrite": "Full Rewrite",
  career_pivot: "Career Pivot",
  "cover-letter": "Cover Letter",
  cover_letter: "Cover Letter",
};

type Analysis = { id: string; type: string; title: string | null; createdAt: string };

export default function HistoryClient({ analyses }: { analyses: Analysis[] }) {
  if (analyses.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No analyses yet</p>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Upload your resume to get started.</p>
        <Link href="/resume-help"
          className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #ca8a04, #fde047)" }}>
          Analyze Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {analyses.map(a => {
        const label = TYPE_LABELS[a.type] ?? a.type;
        const date = new Date(a.createdAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        });
        return (
          <Link key={a.id} href={`/analyses/${a.id}`}
            className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.title ?? label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label} · {date}</p>
            </div>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
