"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedSection { header: string; lines: string[] }
interface ParsedResume { name: string; contact: string; sections: ParsedSection[] }

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseResume(text: string): ParsedResume {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  const name = lines[0] ?? "";
  const contact = lines[1] ?? "";
  const isSH = (l: string) => /^[A-Z][A-Z\s&\/\-]{2,}$/.test(l);
  const sections: ParsedSection[] = [];
  let cur: ParsedSection | null = null;
  for (let i = 2; i < lines.length; i++) {
    const l = lines[i];
    if (isSH(l)) { if (cur) sections.push(cur); cur = { header: l, lines: [] }; }
    else if (cur) cur.lines.push(l);
  }
  if (cur) sections.push(cur);
  return { name, contact, sections };
}

// ─── Sidebar classification keys ─────────────────────────────────────────────

const EXEC_SIDEBAR_KEYS  = ["CONTACT", "SKILL", "COMPETENC", "CERTIF", "LANGUAGE", "INTEREST"];
const TECH_SIDEBAR_KEYS  = ["SKILL", "COMPETENC", "TOOL", "LANGUAGE", "CERTIF", "TECHNOLOG"];
const COL2_SIDEBAR_KEYS  = ["SKILL", "COMPETENC", "CERTIF", "LANGUAGE", "INTEREST", "TOOL"];
const ENTRY_SIDEBAR_KEYS = ["SKILL", "COMPETENC", "CERTIF", "LANGUAGE", "INTEREST", "EDUCATION"];

function inSidebar(header: string, keys: string[]) {
  return keys.some(k => header.includes(k));
}

// ─── Shared JSX line renderer ─────────────────────────────────────────────────

function Lines({ lines, titleColor, textColor, bulletColor, fontSize = 10 }: {
  lines: string[]; titleColor: string; textColor: string; bulletColor?: string; fontSize?: number;
}) {
  let lastWasBullet = false;
  let firstLine = true;
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.startsWith("•");
        const nextIsBullet = lines[i + 1]?.startsWith("•") ?? false;
        if (isBullet) {
          lastWasBullet = true; firstLine = false;
          return <p key={i} style={{ margin: "2px 0 2px 14px", fontSize, color: bulletColor ?? textColor, lineHeight: 1.45 }}>{line}</p>;
        }
        const isTitle = firstLine || lastWasBullet || nextIsBullet;
        firstLine = false; lastWasBullet = false;
        return <p key={i} style={{ fontWeight: isTitle ? 700 : 400, fontSize: isTitle ? fontSize + 0.5 : fontSize, color: isTitle ? titleColor : textColor, margin: isTitle ? "8px 0 1px" : "2px 0", lineHeight: 1.4 }}>{line}</p>;
      })}
    </>
  );
}

// ─── Single-column section block ──────────────────────────────────────────────

function Section({ header, lines, shStyle, titleColor, textColor, fontSize = 10 }: {
  header: string; lines: string[]; shStyle: React.CSSProperties; titleColor: string; textColor: string; fontSize?: number;
}) {
  return (
    <div>
      <div style={shStyle}>{header}</div>
      <Lines lines={lines} titleColor={titleColor} textColor={textColor} fontSize={fontSize} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SINGLE-COLUMN TEMPLATES
// ════════════════════════════════════════════════════════════════════

function ClassicTemplate({ r }: { r: ParsedResume }) {
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#1e293b", borderBottom: "0.75px solid #1e293b", paddingBottom: 2, margin: "16px 0 7px" };
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", padding: "36px 52px", color: "#1e293b" }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{r.contact}</div>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #1e293b", margin: "10px 0 12px" }} />
      {r.sections.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sh} titleColor="#1e293b" textColor="#334155" fontSize={10} />)}
    </div>
  );
}

function ModernTemplate({ r }: { r: ParsedResume }) {
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#DC2626", borderBottom: "1px solid #DC2626", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#DC2626", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "18px 40px" }}>
        {r.sections.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
      </div>
    </div>
  );
}

function ExecutiveAtsTemplate({ r }: { r: ParsedResume }) {
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#1D4ED8", borderBottom: "1px solid #1D4ED8", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#1D4ED8", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "18px 40px" }}>
        {r.sections.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
      </div>
    </div>
  );
}

function TechnicalAtsTemplate({ r }: { r: ParsedResume }) {
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#059669", borderBottom: "1px solid #059669", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#059669", height: 6 }} />
      <div style={{ padding: "18px 40px 10px" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "#6b7280", marginTop: 3 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "4px 40px 18px" }}>
        {r.sections.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
      </div>
    </div>
  );
}

function EntryTemplate({ r }: { r: ParsedResume }) {
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#7c3aed", borderBottom: "1px solid #7c3aed", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "26px 40px 20px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "18px 40px" }}>
        {r.sections.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// TWO-COLUMN TEMPLATES
// ════════════════════════════════════════════════════════════════════

function TwoColLayout({ sidebar, main }: { sidebar: React.ReactNode; main: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: 500 }}>
      {sidebar}
      {main}
    </div>
  );
}

function ClassicTwoColTemplate({ r }: { r: ParsedResume }) {
  const sb = r.sections.filter(s => inSidebar(s.header, COL2_SIDEBAR_KEYS));
  const mn = r.sections.filter(s => !inSidebar(s.header, COL2_SIDEBAR_KEYS));
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1e293b", borderBottom: "0.5px solid #94a3b8", paddingBottom: 2, margin: "12px 0 5px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1e293b", borderBottom: "0.75px solid #1e293b", paddingBottom: 2, margin: "14px 0 6px" };
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", color: "#1e293b" }}>
      <div style={{ textAlign: "center", padding: "28px 40px 10px" }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{r.name}</div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{r.contact}</div>
        <hr style={{ border: "none", borderTop: "1px solid #1e293b", margin: "10px 0 0" }} />
      </div>
      <TwoColLayout
        sidebar={
          <div style={{ width: "30%", background: "#f8fafc", borderRight: "1px solid #e2e8f0", padding: "14px 14px" }}>
            {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#1e293b" textColor="#475569" fontSize={9} />)}
          </div>
        }
        main={
          <div style={{ flex: 1, padding: "14px 20px" }}>
            {mn.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={mnSh} titleColor="#1e293b" textColor="#334155" fontSize={10} />)}
          </div>
        }
      />
    </div>
  );
}

function ModernTwoColTemplate({ r }: { r: ParsedResume }) {
  const sb = r.sections.filter(s => inSidebar(s.header, COL2_SIDEBAR_KEYS));
  const mn = r.sections.filter(s => !inSidebar(s.header, COL2_SIDEBAR_KEYS));
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#f87171", borderBottom: "0.5px solid rgba(248,113,113,0.3)", paddingBottom: 2, margin: "12px 0 5px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#DC2626", borderBottom: "1px solid #DC2626", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#DC2626", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <TwoColLayout
        sidebar={
          <div style={{ width: "30%", background: "#1f2937", padding: "16px 14px" }}>
            {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#fecaca" textColor="rgba(255,255,255,0.8)" fontSize={9} />)}
          </div>
        }
        main={
          <div style={{ flex: 1, padding: "16px 24px" }}>
            {mn.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={mnSh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
          </div>
        }
      />
    </div>
  );
}

function ExecutiveTemplate({ r }: { r: ParsedResume }) {
  const sb = r.sections.filter(s => inSidebar(s.header, EXEC_SIDEBAR_KEYS));
  const mn = r.sections.filter(s => !inSidebar(s.header, EXEC_SIDEBAR_KEYS));
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#93c5fd", borderBottom: "0.5px solid rgba(147,197,253,0.25)", paddingBottom: 2, margin: "14px 0 6px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1D4ED8", borderBottom: "1px solid #1D4ED8", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#1D4ED8", padding: "26px 40px 20px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <TwoColLayout
        sidebar={
          <div style={{ width: "26%", background: "#1e3a8a", padding: "18px 14px" }}>
            {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#dbeafe" textColor="rgba(255,255,255,0.8)" fontSize={9} />)}
          </div>
        }
        main={
          <div style={{ flex: 1, padding: "18px 26px" }}>
            {mn.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={mnSh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
          </div>
        }
      />
    </div>
  );
}

function TechnicalTemplate({ r }: { r: ParsedResume }) {
  const sb = r.sections.filter(s => inSidebar(s.header, TECH_SIDEBAR_KEYS));
  const mn = r.sections.filter(s => !inSidebar(s.header, TECH_SIDEBAR_KEYS));
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6ee7b7", borderBottom: "0.5px solid rgba(110,231,183,0.25)", paddingBottom: 2, margin: "12px 0 5px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#059669", borderBottom: "1px solid #059669", paddingBottom: 2, margin: "12px 0 6px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827", display: "flex", minHeight: 500 }}>
      <div style={{ width: "30%", background: "#064e3b", padding: "26px 14px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{r.name}</div>
        <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>{r.contact}</div>
        {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#d1fae5" textColor="rgba(255,255,255,0.8)" fontSize={9} />)}
      </div>
      <div style={{ flex: 1, padding: "26px 22px" }}>
        {mn.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={mnSh} titleColor="#111827" textColor="#374151" fontSize={9.5} />)}
      </div>
    </div>
  );
}

function EntryTwoColTemplate({ r }: { r: ParsedResume }) {
  const sb = r.sections.filter(s => inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
  const mn = r.sections.filter(s => !inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#7c3aed", borderBottom: "0.5px solid #c4b5fd", paddingBottom: 2, margin: "12px 0 5px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#7c3aed", borderBottom: "1px solid #7c3aed", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <TwoColLayout
        sidebar={
          <div style={{ width: "30%", background: "#faf5ff", borderRight: "1px solid #e9d5ff", padding: "16px 14px" }}>
            {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#4c1d95" textColor="#6d28d9" fontSize={9} />)}
          </div>
        }
        main={
          <div style={{ flex: 1, padding: "16px 24px" }}>
            {mn.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={mnSh} titleColor="#111827" textColor="#374151" fontSize={10} />)}
          </div>
        }
      />
    </div>
  );
}

// ─── Exported preview renderer ────────────────────────────────────────────────

export function ResumeTemplateRenderer({ text, templateId }: { text: string; templateId: string }) {
  const r = parseResume(text);
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, overflow: "auto", maxHeight: 600, border: "1px solid rgba(0,0,0,0.1)" }}>
      <div style={{ background: "white", minWidth: 500 }}>
        {templateId === "classic"       && <ClassicTemplate r={r} />}
        {templateId === "classic-2col"  && <ClassicTwoColTemplate r={r} />}
        {templateId === "modern"        && <ModernTemplate r={r} />}
        {templateId === "modern-2col"   && <ModernTwoColTemplate r={r} />}
        {templateId === "executive-ats" && <ExecutiveAtsTemplate r={r} />}
        {templateId === "executive"     && <ExecutiveTemplate r={r} />}
        {templateId === "technical-ats" && <TechnicalAtsTemplate r={r} />}
        {templateId === "technical"     && <TechnicalTemplate r={r} />}
        {templateId === "entry"         && <EntryTemplate r={r} />}
        {templateId === "entry-2col"    && <EntryTwoColTemplate r={r} />}
        {!templateId                    && <ClassicTemplate r={r} />}
      </div>
    </div>
  );
}

// ─── Print-to-PDF ─────────────────────────────────────────────────────────────

export function printResume(text: string, templateId: string) {
  const r = parseResume(text);
  const win = window.open("", "_blank");
  if (!win) { alert("Please allow popups for this site to download your resume as PDF."); return; }
  win.document.write(buildPrintDocument(r, templateId));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}

// ─── HTML string helpers ──────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildLineHtml(lines: string[]): string {
  let html = "";
  let lastWasBullet = false;
  let firstLine = true;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith("•");
    const nextIsBullet = lines[i + 1]?.startsWith("•") ?? false;
    if (isBullet) {
      html += `<p class="bullet">${esc(line)}</p>`;
      lastWasBullet = true; firstLine = false;
    } else {
      const isTitle = firstLine || lastWasBullet || nextIsBullet;
      firstLine = false; lastWasBullet = false;
      html += `<p class="${isTitle ? "title" : "text"}">${esc(line)}</p>`;
    }
  }
  return html;
}

function sections2html(sections: ParsedSection[]): string {
  return sections.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
}

function sections2htmlPrefixed(sections: ParsedSection[], prefix: string): string {
  return sections.map(s => `<div><div class="${prefix}sh">${esc(s.header)}</div>${buildLineHtml(s.lines).replace(/class="(bullet|title|text)"/g, `class="${prefix}$1"`)}</div>`).join("");
}

const BASE_CSS = `* { margin: 0; padding: 0; box-sizing: border-box; } p { line-height: 1.42; } @media print { @page { margin: 0; size: letter; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

function buildPrintDocument(r: ParsedResume, templateId: string): string {
  let css = "";
  let body = "";

  switch (templateId) {

    // ── Classic ATS ───────────────────────────────────────────────────────────
    case "classic":
    default: {
      css = `${BASE_CSS} body{font-family:'Times New Roman',Times,serif;background:white;padding:48pt 72pt} .name{text-align:center;font-size:22pt;font-weight:700;color:#1e293b;margin-bottom:4pt} .contact{text-align:center;font-size:9.5pt;color:#475569;margin-bottom:8pt} .rule{border:none;border-top:1pt solid #1e293b;margin:8pt 0 12pt} .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1e293b;border-bottom:.75pt solid #1e293b;padding-bottom:2pt;margin:16pt 0 7pt} .title{font-size:11pt;font-weight:700;color:#1e293b;margin:8pt 0 1pt} .text{font-size:10pt;color:#334155;margin:2pt 0} .bullet{font-size:10pt;color:#334155;margin:2pt 0 2pt 14pt}`;
      body = `<div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p><hr class="rule">${sections2html(r.sections)}`;
      break;
    }

    // ── Classic Two-Column ────────────────────────────────────────────────────
    case "classic-2col": {
      css = `${BASE_CSS} body{font-family:'Times New Roman',Times,serif;background:white} .header{text-align:center;padding:36pt 56pt 10pt} .name{font-size:22pt;font-weight:700;color:#1e293b;margin-bottom:4pt} .contact{font-size:9.5pt;color:#475569} .rule{border:none;border-top:1pt solid #1e293b;margin:8pt 0 0} .cols{display:flex;min-height:9in} .sidebar{width:30%;background:#f8fafc;border-right:.75pt solid #e2e8f0;padding:14pt 14pt} .main{flex:1;padding:14pt 20pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1e293b;border-bottom:.5pt solid #94a3b8;padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#1e293b;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:#475569;margin:2pt 0} .sidebar .bullet{font-size:9pt;color:#475569;margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1e293b;border-bottom:.75pt solid #1e293b;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#1e293b;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#334155;margin:2pt 0} .main .bullet{font-size:10pt;color:#334155;margin:2pt 0 2pt 14pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, COL2_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, COL2_SIDEBAR_KEYS));
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p><hr class="rule"></div><div class="cols"><div class="sidebar">${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }

    // ── Modern ATS ────────────────────────────────────────────────────────────
    case "modern": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:#DC2626;padding:28pt 48pt 20pt} .name{font-size:26pt;font-weight:900;color:white;letter-spacing:-.5pt} .contact{font-size:9.5pt;color:rgba(255,255,255,.85);margin-top:4pt} .body{padding:18pt 48pt} .sh{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#DC2626;border-bottom:1pt solid #DC2626;padding-bottom:2pt;margin:14pt 0 6pt} .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .text{font-size:10pt;color:#374151;margin:2pt 0} .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${sections2html(r.sections)}</div>`;
      break;
    }

    // ── Modern Two-Column ─────────────────────────────────────────────────────
    case "modern-2col": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:#DC2626;padding:26pt 40pt 18pt} .name{font-size:26pt;font-weight:900;color:white;letter-spacing:-.5pt} .contact{font-size:9.5pt;color:rgba(255,255,255,.85);margin-top:4pt} .cols{display:flex;min-height:9in} .sidebar{width:30%;background:#1f2937;padding:16pt 14pt} .main{flex:1;padding:16pt 24pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#f87171;border-bottom:.5pt solid rgba(248,113,113,.3);padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#fecaca;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#DC2626;border-bottom:1pt solid #DC2626;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, COL2_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, COL2_SIDEBAR_KEYS));
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="cols"><div class="sidebar">${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }

    // ── Executive ATS ─────────────────────────────────────────────────────────
    case "executive-ats": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:#1D4ED8;padding:28pt 48pt 20pt} .name{font-size:26pt;font-weight:900;color:white;letter-spacing:-.5pt} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .body{padding:20pt 48pt} .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1D4ED8;border-bottom:1pt solid #1D4ED8;padding-bottom:2pt;margin:14pt 0 7pt} .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .text{font-size:10pt;color:#374151;margin:2pt 0} .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${sections2html(r.sections)}</div>`;
      break;
    }

    // ── Executive Two-Column ──────────────────────────────────────────────────
    case "executive": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white;display:flex;flex-direction:column;min-height:11in} .header{background:#1D4ED8;padding:28pt 40pt 20pt} .name{font-size:26pt;font-weight:900;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .cols{display:flex;flex:1} .sidebar{width:26%;background:#1e3a8a;padding:18pt 14pt} .main{flex:1;padding:18pt 28pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#93c5fd;border-bottom:.5pt solid rgba(147,197,253,.25);padding-bottom:2pt;margin:14pt 0 6pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#dbeafe;margin:8pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1D4ED8;border-bottom:1pt solid #1D4ED8;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, EXEC_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, EXEC_SIDEBAR_KEYS));
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="cols"><div class="sidebar">${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }

    // ── Technical ATS ─────────────────────────────────────────────────────────
    case "technical-ats": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .accent{background:#059669;height:6pt} .nameblock{padding:18pt 48pt 10pt} .name{font-size:22pt;font-weight:800;color:#111827} .contact{font-size:9.5pt;color:#6b7280;margin-top:3pt} .body{padding:4pt 48pt 22pt} .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#059669;border-bottom:1pt solid #059669;padding-bottom:2pt;margin:14pt 0 7pt} .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .text{font-size:10pt;color:#374151;margin:2pt 0} .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      body = `<div class="accent"></div><div class="nameblock"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${sections2html(r.sections)}</div>`;
      break;
    }

    // ── Technical Two-Column ──────────────────────────────────────────────────
    case "technical": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white;display:flex;min-height:11in} .sidebar{width:30%;background:#064e3b;padding:26pt 16pt} .main{flex:1;padding:26pt 24pt} .sidebar .sname{font-size:18pt;font-weight:800;color:white;margin-bottom:3pt} .sidebar .contact{font-size:8.5pt;color:rgba(255,255,255,.7);margin-bottom:14pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#6ee7b7;border-bottom:.5pt solid rgba(110,231,183,.25);padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#d1fae5;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#059669;border-bottom:1pt solid #059669;padding-bottom:2pt;margin:12pt 0 6pt} .main .title{font-size:10.5pt;font-weight:700;color:#111827;margin:7pt 0 1pt} .main .text{font-size:9.5pt;color:#374151;margin:2pt 0} .main .bullet{font-size:9.5pt;color:#374151;margin:2pt 0 2pt 13pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, TECH_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, TECH_SIDEBAR_KEYS));
      body = `<div class="sidebar"><div class="sname">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p>${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div>`;
      break;
    }

    // ── Entry Level ATS ───────────────────────────────────────────────────────
    case "entry": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:28pt 48pt 20pt} .name{font-size:24pt;font-weight:800;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .body{padding:18pt 48pt} .sh{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#7c3aed;border-bottom:1pt solid #7c3aed;padding-bottom:2pt;margin:14pt 0 6pt} .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .text{font-size:10pt;color:#374151;margin:2pt 0} .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${sections2html(r.sections)}</div>`;
      break;
    }

    // ── Entry Two-Column ──────────────────────────────────────────────────────
    case "entry-2col": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:26pt 40pt 18pt} .name{font-size:24pt;font-weight:800;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .cols{display:flex;min-height:9in} .sidebar{width:30%;background:#faf5ff;border-right:.75pt solid #e9d5ff;padding:16pt 14pt} .main{flex:1;padding:16pt 24pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#7c3aed;border-bottom:.5pt solid #c4b5fd;padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#4c1d95;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:#6d28d9;margin:2pt 0} .sidebar .bullet{font-size:9pt;color:#6d28d9;margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#7c3aed;border-bottom:1pt solid #7c3aed;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="cols"><div class="sidebar">${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(r.name)} – Resume</title><style>${css}</style></head><body>${body}</body></html>`;
}
