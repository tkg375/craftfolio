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

// ─── Sidebar section classification ──────────────────────────────────────────

const EXEC_SIDEBAR_KEYS = ["CONTACT", "SKILL", "COMPETENC", "CERTIF", "LANGUAGE", "INTEREST"];
const TECH_SIDEBAR_KEYS = ["SKILL", "COMPETENC", "TOOL", "LANGUAGE", "CERTIF", "TECHNOLOG"];

function inSidebar(header: string, keys: string[]) {
  return keys.some(k => header.includes(k));
}

// ─── Shared line renderer (JSX) ───────────────────────────────────────────────

function Lines({ lines, titleColor, textColor, bulletColor, fontSize = 10 }: {
  lines: string[];
  titleColor: string;
  textColor: string;
  bulletColor?: string;
  fontSize?: number;
}) {
  let lastWasBullet = false;
  let firstLine = true;
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = line.startsWith("•");
        const nextIsBullet = lines[i + 1]?.startsWith("•") ?? false;
        if (isBullet) {
          lastWasBullet = true;
          firstLine = false;
          return (
            <p key={i} style={{ margin: "2px 0 2px 14px", fontSize, color: bulletColor ?? textColor, lineHeight: 1.45 }}>
              {line}
            </p>
          );
        }
        const isTitle = firstLine || lastWasBullet || nextIsBullet;
        firstLine = false;
        lastWasBullet = false;
        return (
          <p key={i} style={{ fontWeight: isTitle ? 700 : 400, fontSize: isTitle ? fontSize + 0.5 : fontSize, color: isTitle ? titleColor : textColor, margin: isTitle ? "8px 0 1px" : "2px 0", lineHeight: 1.4 }}>
            {line}
          </p>
        );
      })}
    </>
  );
}

// ─── Preview template components ──────────────────────────────────────────────

function ClassicTemplate({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", padding: "36px 52px", color: "#1e293b" }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{r.contact}</div>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #1e293b", margin: "10px 0 12px" }} />
      {r.sections.map((s, i) => (
        <div key={i}>
          <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#1e293b", borderBottom: "0.75px solid #1e293b", paddingBottom: 2, margin: "16px 0 7px" }}>{s.header}</div>
          <Lines lines={s.lines} titleColor="#1e293b" textColor="#334155" fontSize={10} />
        </div>
      ))}
    </div>
  );
}

function ModernTemplate({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#DC2626", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "18px 40px" }}>
        {r.sections.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#DC2626", borderBottom: "1px solid #DC2626", paddingBottom: 2, margin: "14px 0 7px" }}>{s.header}</div>
            <Lines lines={s.lines} titleColor="#111827" textColor="#374151" fontSize={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveTemplate({ r }: { r: ParsedResume }) {
  const sidebar = r.sections.filter(s => inSidebar(s.header, EXEC_SIDEBAR_KEYS));
  const main = r.sections.filter(s => !inSidebar(s.header, EXEC_SIDEBAR_KEYS));
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "#1D4ED8", padding: "26px 40px 20px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ display: "flex", minHeight: 500 }}>
        <div style={{ width: "26%", background: "#1e3a8a", padding: "18px 14px" }}>
          {sidebar.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#93c5fd", borderBottom: "0.5px solid rgba(147,197,253,0.25)", paddingBottom: 2, margin: "14px 0 6px" }}>{s.header}</div>
              <Lines lines={s.lines} titleColor="#dbeafe" textColor="rgba(255,255,255,0.8)" fontSize={9} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: "18px 26px" }}>
          {main.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1D4ED8", borderBottom: "1px solid #1D4ED8", paddingBottom: 2, margin: "14px 0 7px" }}>{s.header}</div>
              <Lines lines={s.lines} titleColor="#111827" textColor="#374151" fontSize={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicalTemplate({ r }: { r: ParsedResume }) {
  const sidebar = r.sections.filter(s => inSidebar(s.header, TECH_SIDEBAR_KEYS));
  const main = r.sections.filter(s => !inSidebar(s.header, TECH_SIDEBAR_KEYS));
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827", display: "flex", minHeight: 500 }}>
      <div style={{ width: "30%", background: "#064e3b", padding: "26px 14px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{r.name}</div>
        <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>{r.contact}</div>
        {sidebar.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6ee7b7", borderBottom: "0.5px solid rgba(110,231,183,0.25)", paddingBottom: 2, margin: "12px 0 5px" }}>{s.header}</div>
            <Lines lines={s.lines} titleColor="#d1fae5" textColor="rgba(255,255,255,0.8)" fontSize={9} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "26px 22px" }}>
        {main.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#059669", borderBottom: "1px solid #059669", paddingBottom: 2, margin: "12px 0 6px" }}>{s.header}</div>
            <Lines lines={s.lines} titleColor="#111827" textColor="#374151" fontSize={9.5} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryTemplate({ r }: { r: ParsedResume }) {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #5b21b6, #7c3aed)", padding: "26px 40px 20px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <div style={{ padding: "18px 40px" }}>
        {r.sections.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#7c3aed", borderBottom: "1px solid #7c3aed", paddingBottom: 2, margin: "14px 0 7px" }}>{s.header}</div>
            <Lines lines={s.lines} titleColor="#111827" textColor="#374151" fontSize={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Exported preview renderer ────────────────────────────────────────────────

export function ResumeTemplateRenderer({ text, templateId }: { text: string; templateId: string }) {
  const r = parseResume(text);
  return (
    <div style={{ background: "#f8fafc", borderRadius: 12, overflow: "auto", maxHeight: 600, border: "1px solid rgba(0,0,0,0.1)" }}>
      <div style={{ background: "white", minWidth: 500 }}>
        {templateId === "modern"    && <ModernTemplate r={r} />}
        {templateId === "executive" && <ExecutiveTemplate r={r} />}
        {templateId === "technical" && <TechnicalTemplate r={r} />}
        {templateId === "entry"     && <EntryTemplate r={r} />}
        {(templateId === "classic" || !templateId) && <ClassicTemplate r={r} />}
      </div>
    </div>
  );
}

// ─── Print-to-PDF (opens new window, auto-triggers print dialog) ──────────────

export function printResume(text: string, templateId: string) {
  const r = parseResume(text);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups for this site to download your resume as PDF.");
    return;
  }
  win.document.write(buildPrintDocument(r, templateId));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
}

// ─── HTML string builder for print window ────────────────────────────────────

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
      lastWasBullet = true;
      firstLine = false;
    } else {
      const isTitle = firstLine || lastWasBullet || nextIsBullet;
      firstLine = false;
      lastWasBullet = false;
      html += `<p class="${isTitle ? "title" : "text"}">${esc(line)}</p>`;
    }
  }
  return html;
}

function buildPrintDocument(r: ParsedResume, templateId: string): string {
  const base = `* { margin: 0; padding: 0; box-sizing: border-box; } p { line-height: 1.42; } @media print { @page { margin: 0; size: letter; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`;

  let css = "";
  let body = "";

  switch (templateId) {
    case "modern": {
      css = `${base} body { font-family: Arial, Helvetica, sans-serif; background: white; } .header { background: #DC2626; padding: 28pt 48pt 20pt; } .name { font-size: 26pt; font-weight: 900; color: white; letter-spacing: -0.5pt; } .contact { font-size: 9.5pt; color: rgba(255,255,255,0.85); margin-top: 4pt; } .body { padding: 18pt 48pt; } .sh { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #DC2626; border-bottom: 1pt solid #DC2626; padding-bottom: 2pt; margin: 14pt 0 6pt; } .title { font-size: 11pt; font-weight: 700; color: #111827; margin: 8pt 0 1pt; } .text { font-size: 10pt; color: #374151; margin: 2pt 0; } .bullet { font-size: 10pt; color: #374151; margin: 2pt 0 2pt 14pt; }`;
      const secs = r.sections.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${secs}</div>`;
      break;
    }

    case "executive": {
      css = `${base} body { font-family: Arial, Helvetica, sans-serif; background: white; display: flex; flex-direction: column; min-height: 11in; } .header { background: #1D4ED8; padding: 28pt 40pt 20pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .name { font-size: 26pt; font-weight: 900; color: white; } .contact { font-size: 9.5pt; color: rgba(255,255,255,0.8); margin-top: 4pt; } .cols { display: flex; flex: 1; } .sidebar { width: 26%; background: #1e3a8a; padding: 18pt 14pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .main { flex: 1; padding: 18pt 28pt; } .sidebar .sh { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #93c5fd; border-bottom: 0.5pt solid rgba(147,197,253,0.25); padding-bottom: 2pt; margin: 14pt 0 6pt; } .sidebar .title { font-size: 9.5pt; font-weight: 700; color: #dbeafe; margin: 8pt 0 1pt; } .sidebar .text { font-size: 9pt; color: rgba(255,255,255,0.8); margin: 2pt 0; } .sidebar .bullet { font-size: 9pt; color: rgba(255,255,255,0.75); margin: 2pt 0 2pt 12pt; } .main .sh { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #1D4ED8; border-bottom: 1pt solid #1D4ED8; padding-bottom: 2pt; margin: 14pt 0 7pt; } .main .title { font-size: 11pt; font-weight: 700; color: #111827; margin: 8pt 0 1pt; } .main .text { font-size: 10pt; color: #374151; margin: 2pt 0; } .main .bullet { font-size: 10pt; color: #374151; margin: 2pt 0 2pt 14pt; }`;
      const sidebar = r.sections.filter(s => inSidebar(s.header, EXEC_SIDEBAR_KEYS));
      const main = r.sections.filter(s => !inSidebar(s.header, EXEC_SIDEBAR_KEYS));
      const sideHtml = sidebar.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      const mainHtml = main.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="cols"><div class="sidebar">${sideHtml}</div><div class="main">${mainHtml}</div></div>`;
      break;
    }

    case "technical": {
      css = `${base} body { font-family: Arial, Helvetica, sans-serif; background: white; display: flex; min-height: 11in; } .sidebar { width: 30%; background: #064e3b; padding: 26pt 16pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .main { flex: 1; padding: 26pt 24pt; } .sidebar .sname { font-size: 18pt; font-weight: 800; color: white; margin-bottom: 3pt; } .sidebar .contact { font-size: 8.5pt; color: rgba(255,255,255,0.7); margin-bottom: 14pt; } .sidebar .sh { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #6ee7b7; border-bottom: 0.5pt solid rgba(110,231,183,0.25); padding-bottom: 2pt; margin: 12pt 0 5pt; } .sidebar .title { font-size: 9.5pt; font-weight: 700; color: #d1fae5; margin: 7pt 0 1pt; } .sidebar .text { font-size: 9pt; color: rgba(255,255,255,0.8); margin: 2pt 0; } .sidebar .bullet { font-size: 9pt; color: rgba(255,255,255,0.75); margin: 2pt 0 2pt 12pt; } .main .sh { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #059669; border-bottom: 1pt solid #059669; padding-bottom: 2pt; margin: 12pt 0 6pt; } .main .title { font-size: 10.5pt; font-weight: 700; color: #111827; margin: 7pt 0 1pt; } .main .text { font-size: 9.5pt; color: #374151; margin: 2pt 0; } .main .bullet { font-size: 9.5pt; color: #374151; margin: 2pt 0 2pt 13pt; }`;
      const sidebar = r.sections.filter(s => inSidebar(s.header, TECH_SIDEBAR_KEYS));
      const main = r.sections.filter(s => !inSidebar(s.header, TECH_SIDEBAR_KEYS));
      const sideHtml = sidebar.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      const mainHtml = main.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      body = `<div class="sidebar"><div class="sname">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p>${sideHtml}</div><div class="main">${mainHtml}</div>`;
      break;
    }

    case "entry": {
      css = `${base} body { font-family: Arial, Helvetica, sans-serif; background: white; } .header { background: linear-gradient(135deg, #5b21b6, #7c3aed); padding: 28pt 48pt 20pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .name { font-size: 24pt; font-weight: 800; color: white; } .contact { font-size: 9.5pt; color: rgba(255,255,255,0.8); margin-top: 4pt; } .body { padding: 18pt 48pt; } .sh { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #7c3aed; border-bottom: 1pt solid #7c3aed; padding-bottom: 2pt; margin: 14pt 0 6pt; } .title { font-size: 11pt; font-weight: 700; color: #111827; margin: 8pt 0 1pt; } .text { font-size: 10pt; color: #374151; margin: 2pt 0; } .bullet { font-size: 10pt; color: #374151; margin: 2pt 0 2pt 14pt; }`;
      const secs = r.sections.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${secs}</div>`;
      break;
    }

    default: { // classic
      css = `${base} body { font-family: 'Times New Roman', Times, serif; background: white; padding: 48pt 72pt; } .name { text-align: center; font-size: 22pt; font-weight: 700; color: #1e293b; margin-bottom: 4pt; } .contact { text-align: center; font-size: 9.5pt; color: #475569; margin-bottom: 8pt; } .rule { border: none; border-top: 1pt solid #1e293b; margin: 8pt 0 12pt; } .sh { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5pt; color: #1e293b; border-bottom: 0.75pt solid #1e293b; padding-bottom: 2pt; margin: 16pt 0 7pt; } .title { font-size: 11pt; font-weight: 700; color: #1e293b; margin: 8pt 0 1pt; } .text { font-size: 10pt; color: #334155; margin: 2pt 0; } .bullet { font-size: 10pt; color: #334155; margin: 2pt 0 2pt 14pt; }`;
      const secs = r.sections.map(s => `<div><div class="sh">${esc(s.header)}</div>${buildLineHtml(s.lines)}</div>`).join("");
      body = `<div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p><hr class="rule">${secs}`;
      break;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(r.name)} – Resume</title><style>${css}</style></head><body>${body}</body></html>`;
}
