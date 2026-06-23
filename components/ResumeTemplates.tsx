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
        const prevIsMetaLine = (lines[i - 1] ?? "").includes(" | ");
        if (isBullet) {
          lastWasBullet = true; firstLine = false;
          return <p key={i} style={{ margin: "2px 0 2px 14px", fontSize, color: bulletColor ?? textColor, lineHeight: 1.45 }}>{line}</p>;
        }
        const isTitle = firstLine || lastWasBullet || nextIsBullet || prevIsMetaLine;
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
  const sh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#ca8a04", borderBottom: "1px solid #ca8a04", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #854d0e, #ca8a04)", padding: "26px 40px 20px" }}>
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
  const sbSh: React.CSSProperties = { fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#ca8a04", borderBottom: "0.5px solid #fef08a", paddingBottom: 2, margin: "12px 0 5px" };
  const mnSh: React.CSSProperties = { fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#ca8a04", borderBottom: "1px solid #ca8a04", paddingBottom: 2, margin: "14px 0 7px" };
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #854d0e, #ca8a04)", padding: "26px 40px 18px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{r.name}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{r.contact}</div>
      </div>
      <TwoColLayout
        sidebar={
          <div style={{ width: "30%", background: "#fefce8", borderRight: "1px solid #fef9c3", padding: "16px 14px" }}>
            {sb.map((s, i) => <Section key={i} header={s.header} lines={s.lines} shStyle={sbSh} titleColor="#713f12" textColor="#a16207" fontSize={9} />)}
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

// ─── PDF Export (jsPDF programmatic rendering) ────────────────────────────────

type RGB = [number, number, number];
function h2r(hex: string): RGB {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

interface PdfCfg {
  font: "helvetica" | "times";
  headerBg: string | null;
  headerPadX: number; headerPadY: number;
  nameColor: string; nameSize: number; nameBold: boolean;
  contactColor: string; contactSize: number;
  accentBarColor: string | null; // thin top bar (technical-ats)
  sidebarW: number; // 0 = single col
  sidebarBg: string | null;
  sidebarPadX: number; sidebarPadY: number;
  sidebarShColor: string; sidebarShBorder: string;
  sidebarTitleColor: string; sidebarTextColor: string;
  sidebarKeys: string[];
  nameInSidebar: boolean; // technical: name/contact go inside sidebar
  bodyPadX: number; bodyPadY: number; // single-col or main-col padding
  accentColor: string;
  mainTitleColor: string; mainTextColor: string;
}

const PDF_CFGS: Record<string, PdfCfg> = {
  classic: { font:"times", headerBg:null, headerPadX:72, headerPadY:36, nameColor:"#1e293b", nameSize:22, nameBold:true, contactColor:"#64748b", contactSize:9.5, accentBarColor:null, sidebarW:0, sidebarBg:null, sidebarPadX:0, sidebarPadY:0, sidebarShColor:"#1e293b", sidebarShBorder:"#1e293b", sidebarTitleColor:"#1e293b", sidebarTextColor:"#475569", sidebarKeys:[], nameInSidebar:false, bodyPadX:72, bodyPadY:12, accentColor:"#1e293b", mainTitleColor:"#1e293b", mainTextColor:"#334155" },
  "classic-2col": { font:"times", headerBg:null, headerPadX:56, headerPadY:36, nameColor:"#1e293b", nameSize:22, nameBold:true, contactColor:"#475569", contactSize:9.5, accentBarColor:null, sidebarW:170, sidebarBg:"#f8fafc", sidebarPadX:14, sidebarPadY:14, sidebarShColor:"#1e293b", sidebarShBorder:"#94a3b8", sidebarTitleColor:"#1e293b", sidebarTextColor:"#475569", sidebarKeys:COL2_SIDEBAR_KEYS, nameInSidebar:false, bodyPadX:20, bodyPadY:14, accentColor:"#1e293b", mainTitleColor:"#1e293b", mainTextColor:"#334155" },
  modern: { font:"helvetica", headerBg:"#DC2626", headerPadX:48, headerPadY:26, nameColor:"#ffffff", nameSize:26, nameBold:true, contactColor:"rgba(255,255,255,0.85)", contactSize:9.5, accentBarColor:null, sidebarW:0, sidebarBg:null, sidebarPadX:0, sidebarPadY:0, sidebarShColor:"#DC2626", sidebarShBorder:"#DC2626", sidebarTitleColor:"#111827", sidebarTextColor:"#374151", sidebarKeys:[], nameInSidebar:false, bodyPadX:48, bodyPadY:18, accentColor:"#DC2626", mainTitleColor:"#111827", mainTextColor:"#374151" },
  "modern-2col": { font:"helvetica", headerBg:"#DC2626", headerPadX:40, headerPadY:26, nameColor:"#ffffff", nameSize:26, nameBold:true, contactColor:"rgba(255,255,255,0.85)", contactSize:9.5, accentBarColor:null, sidebarW:175, sidebarBg:"#1f2937", sidebarPadX:14, sidebarPadY:16, sidebarShColor:"#f87171", sidebarShBorder:"rgba(248,113,113,0.3)", sidebarTitleColor:"#fecaca", sidebarTextColor:"rgba(255,255,255,0.8)", sidebarKeys:COL2_SIDEBAR_KEYS, nameInSidebar:false, bodyPadX:24, bodyPadY:16, accentColor:"#DC2626", mainTitleColor:"#111827", mainTextColor:"#374151" },
  "executive-ats": { font:"helvetica", headerBg:"#1D4ED8", headerPadX:48, headerPadY:28, nameColor:"#ffffff", nameSize:26, nameBold:true, contactColor:"rgba(255,255,255,0.8)", contactSize:9.5, accentBarColor:null, sidebarW:0, sidebarBg:null, sidebarPadX:0, sidebarPadY:0, sidebarShColor:"#1D4ED8", sidebarShBorder:"#1D4ED8", sidebarTitleColor:"#111827", sidebarTextColor:"#374151", sidebarKeys:[], nameInSidebar:false, bodyPadX:48, bodyPadY:20, accentColor:"#1D4ED8", mainTitleColor:"#111827", mainTextColor:"#374151" },
  executive: { font:"helvetica", headerBg:"#1D4ED8", headerPadX:40, headerPadY:28, nameColor:"#ffffff", nameSize:26, nameBold:true, contactColor:"rgba(255,255,255,0.8)", contactSize:9.5, accentBarColor:null, sidebarW:152, sidebarBg:"#1e3a8a", sidebarPadX:14, sidebarPadY:18, sidebarShColor:"#93c5fd", sidebarShBorder:"rgba(147,197,253,0.25)", sidebarTitleColor:"#dbeafe", sidebarTextColor:"rgba(255,255,255,0.8)", sidebarKeys:EXEC_SIDEBAR_KEYS, nameInSidebar:false, bodyPadX:28, bodyPadY:18, accentColor:"#1D4ED8", mainTitleColor:"#111827", mainTextColor:"#374151" },
  "technical-ats": { font:"helvetica", headerBg:null, headerPadX:48, headerPadY:18, nameColor:"#111827", nameSize:22, nameBold:true, contactColor:"#6b7280", contactSize:9.5, accentBarColor:"#059669", sidebarW:0, sidebarBg:null, sidebarPadX:0, sidebarPadY:0, sidebarShColor:"#059669", sidebarShBorder:"#059669", sidebarTitleColor:"#111827", sidebarTextColor:"#374151", sidebarKeys:[], nameInSidebar:false, bodyPadX:48, bodyPadY:4, accentColor:"#059669", mainTitleColor:"#111827", mainTextColor:"#374151" },
  technical: { font:"helvetica", headerBg:null, headerPadX:16, headerPadY:26, nameColor:"#ffffff", nameSize:18, nameBold:true, contactColor:"rgba(255,255,255,0.7)", contactSize:8.5, accentBarColor:null, sidebarW:175, sidebarBg:"#064e3b", sidebarPadX:16, sidebarPadY:26, sidebarShColor:"#6ee7b7", sidebarShBorder:"rgba(110,231,183,0.25)", sidebarTitleColor:"#d1fae5", sidebarTextColor:"rgba(255,255,255,0.8)", sidebarKeys:TECH_SIDEBAR_KEYS, nameInSidebar:true, bodyPadX:24, bodyPadY:26, accentColor:"#059669", mainTitleColor:"#111827", mainTextColor:"#374151" },
  entry: { font:"helvetica", headerBg:"#ca8a04", headerPadX:48, headerPadY:28, nameColor:"#ffffff", nameSize:24, nameBold:true, contactColor:"rgba(255,255,255,0.8)", contactSize:9.5, accentBarColor:null, sidebarW:0, sidebarBg:null, sidebarPadX:0, sidebarPadY:0, sidebarShColor:"#ca8a04", sidebarShBorder:"#ca8a04", sidebarTitleColor:"#111827", sidebarTextColor:"#374151", sidebarKeys:[], nameInSidebar:false, bodyPadX:48, bodyPadY:18, accentColor:"#ca8a04", mainTitleColor:"#111827", mainTextColor:"#374151" },
  "entry-2col": { font:"helvetica", headerBg:"#ca8a04", headerPadX:40, headerPadY:26, nameColor:"#ffffff", nameSize:24, nameBold:true, contactColor:"rgba(255,255,255,0.8)", contactSize:9.5, accentBarColor:null, sidebarW:175, sidebarBg:"#fefce8", sidebarPadX:14, sidebarPadY:16, sidebarShColor:"#ca8a04", sidebarShBorder:"#fef08a", sidebarTitleColor:"#713f12", sidebarTextColor:"#a16207", sidebarKeys:ENTRY_SIDEBAR_KEYS, nameInSidebar:false, bodyPadX:24, bodyPadY:16, accentColor:"#ca8a04", mainTitleColor:"#111827", mainTextColor:"#374151" },
};

function parseRgba(color: string): RGB {
  if (color.startsWith("#")) return h2r(color);
  // rgba(r,g,b,a) or rgb(r,g,b)
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])];
  return [0, 0, 0];
}

// Render one block of lines (section content) and return new Y
function renderLines(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any, lines: string[], x: number, maxW: number, startY: number,
  titleColor: RGB, textColor: RGB, fontSize: number, lineH: number,
  pageH: number, marginBottom: number
): number {
  let y = startY;
  let lastWasBullet = false;
  let firstLine = true;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith("•");
    const nextIsBullet = lines[i + 1]?.startsWith("•") ?? false;
    const prevIsMetaLine = (lines[i - 1] ?? "").includes(" | ");
    const isTitle = !isBullet && (firstLine || lastWasBullet || nextIsBullet || prevIsMetaLine);

    if (isBullet) {
      lastWasBullet = true; firstLine = false;
      const bulletX = x + 10;
      const bulletW = maxW - 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...textColor);
      const wrapped = doc.splitTextToSize(line, bulletW) as string[];
      for (const wl of wrapped) {
        if (y + lineH > pageH - marginBottom) { doc.addPage(); y = 36; }
        doc.text(wl, bulletX, y);
        y += lineH;
      }
    } else {
      if (isTitle) {
        y += 4;
        doc.setFont(doc.getFont().fontName as string, "bold");
        doc.setFontSize(fontSize + 0.5);
        doc.setTextColor(...titleColor);
      } else {
        doc.setFont(doc.getFont().fontName as string, "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(...textColor);
      }
      const wrapped = doc.splitTextToSize(line, maxW) as string[];
      for (const wl of wrapped) {
        if (y + lineH > pageH - marginBottom) { doc.addPage(); y = 36; }
        doc.text(wl, x, y);
        y += lineH + (isTitle ? 1 : 0);
      }
      firstLine = false; lastWasBullet = false;
    }
  }
  return y;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderSection(doc: any, sec: ParsedSection, x: number, maxW: number, y: number, cfg: PdfCfg, isSidebar: boolean, pageH: number): number {
  const accentRgb = parseRgba(isSidebar ? cfg.sidebarShColor : cfg.accentColor);
  const borderRgb = parseRgba(isSidebar ? cfg.sidebarShBorder : cfg.accentColor);
  const titleRgb = parseRgba(isSidebar ? cfg.sidebarTitleColor : cfg.mainTitleColor);
  const textRgb = parseRgba(isSidebar ? cfg.sidebarTextColor : cfg.mainTextColor);
  const shSize = 7.5;
  const lineH = isSidebar ? 11 : 12;
  const contentSize = isSidebar ? 9 : 10;

  y += isSidebar ? 10 : 12;
  if (y + 20 > pageH - 36) { doc.addPage(); y = 36; }

  // Section header text
  doc.setFont(cfg.font, "bold");
  doc.setFontSize(shSize);
  doc.setTextColor(...accentRgb);
  doc.text(sec.header, x, y);
  y += 3;

  // Underline
  doc.setDrawColor(...borderRgb);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + maxW, y);
  y += 6;

  // Content
  doc.setFont(cfg.font, "normal");
  return renderLines(doc, sec.lines, x, maxW, y, titleRgb, textRgb, contentSize, lineH, pageH, 36);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPdf(doc: any, r: ParsedResume, templateId: string) {
  const cfg = PDF_CFGS[templateId] ?? PDF_CFGS["classic"];
  const PW = 612, PH = 792;
  let y = 0;

  // ── Accent bar (technical-ats) ──────────────────────────────────────────────
  if (cfg.accentBarColor) {
    doc.setFillColor(...h2r(cfg.accentBarColor));
    doc.rect(0, 0, PW, 6, "F");
    y = 6;
  }

  // ── Header block ────────────────────────────────────────────────────────────
  const isTwoCol = cfg.sidebarW > 0;
  const mainX = cfg.sidebarW > 0 ? cfg.sidebarW + cfg.bodyPadX : cfg.bodyPadX;
  const mainW = PW - mainX - (isTwoCol ? 20 : cfg.bodyPadX);

  if (!cfg.nameInSidebar) {
    const nameLines = doc.splitTextToSize(r.name, PW - cfg.headerPadX * 2) as string[];
    const contactLines = doc.splitTextToSize(r.contact, PW - cfg.headerPadX * 2) as string[];
    const nameLineH = cfg.nameSize * 1.25;
    const contactLineH = cfg.contactSize * 1.4;
    const headerH = cfg.headerPadY + nameLines.length * nameLineH + 4 + contactLines.length * contactLineH + cfg.headerPadY;

    if (cfg.headerBg) {
      doc.setFillColor(...h2r(cfg.headerBg));
      doc.rect(0, y, PW, headerH, "F");
    }

    let hy = y + cfg.headerPadY + cfg.nameSize * 0.75;
    doc.setFont(cfg.font, "bold");
    doc.setFontSize(cfg.nameSize);
    doc.setTextColor(...parseRgba(cfg.nameColor));
    for (const nl of nameLines) { doc.text(nl, cfg.headerPadX, hy); hy += nameLineH; }

    hy += 2;
    doc.setFont(cfg.font, "normal");
    doc.setFontSize(cfg.contactSize);
    doc.setTextColor(...parseRgba(cfg.contactColor));
    for (const cl of contactLines) { doc.text(cl, cfg.headerPadX, hy); hy += contactLineH; }

    y += headerH;

    // Thin separator for classic (no colored header)
    if (!cfg.headerBg && !cfg.accentBarColor) {
      doc.setDrawColor(...h2r(cfg.accentColor));
      doc.setLineWidth(0.75);
      doc.line(cfg.headerPadX, y, PW - cfg.headerPadX, y);
      y += 4;
    }
  }

  // ── Sidebar background ───────────────────────────────────────────────────────
  if (isTwoCol && cfg.sidebarBg) {
    doc.setFillColor(...h2r(cfg.sidebarBg));
    doc.rect(0, y, cfg.sidebarW, PH - y, "F");
  }

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const sbSecs = r.sections.filter(s => inSidebar(s.header, cfg.sidebarKeys));
  const mnSecs = r.sections.filter(s => !inSidebar(s.header, cfg.sidebarKeys));

  if (isTwoCol) {
    let sbY = y + cfg.sidebarPadY;
    const sbX = cfg.sidebarPadX;
    const sbW = cfg.sidebarW - cfg.sidebarPadX * 2;

    // Name in sidebar (technical template)
    if (cfg.nameInSidebar) {
      doc.setFont(cfg.font, "bold");
      doc.setFontSize(cfg.nameSize);
      doc.setTextColor(...parseRgba(cfg.nameColor));
      const nameLines = doc.splitTextToSize(r.name, sbW) as string[];
      for (const nl of nameLines) { doc.text(nl, sbX, sbY + cfg.nameSize * 0.75); sbY += cfg.nameSize * 1.2; }
      sbY += 3;
      doc.setFont(cfg.font, "normal");
      doc.setFontSize(cfg.contactSize);
      doc.setTextColor(...parseRgba(cfg.contactColor));
      const cLines = doc.splitTextToSize(r.contact.replace(/ \| /g, "\n"), sbW) as string[];
      for (const cl of cLines) { doc.text(cl, sbX, sbY); sbY += cfg.contactSize * 1.4; }
      sbY += 10;
    }

    for (const sec of sbSecs) {
      sbY = renderSection(doc, sec, sbX, sbW, sbY, cfg, true, PH);
      sbY += 4;
    }

    // ── Main content ──────────────────────────────────────────────────────────
    let mnY = y + cfg.bodyPadY;
    for (const sec of mnSecs) {
      mnY = renderSection(doc, sec, mainX, mainW, mnY, cfg, false, PH);
      mnY += 2;
    }
  } else {
    // Single column
    let mnY = y + cfg.bodyPadY;
    for (const sec of r.sections) {
      mnY = renderSection(doc, sec, cfg.bodyPadX, PW - cfg.bodyPadX * 2, mnY, cfg, false, PH);
      mnY += 2;
    }
  }
}

export async function downloadResumePdf(text: string, templateId: string) {
  const r = parseResume(text);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  buildPdf(doc, r, templateId);
  const safeName = r.name.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") || "Resume";
  doc.save(`${safeName}_Resume.pdf`);
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
    const prevIsMetaLine = (lines[i - 1] ?? "").includes(" | ");
    if (isBullet) {
      html += `<p class="bullet">${esc(line)}</p>`;
      lastWasBullet = true; firstLine = false;
    } else {
      const isTitle = firstLine || lastWasBullet || nextIsBullet || prevIsMetaLine;
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
      css = `${BASE_CSS} body{font-family:'Times New Roman',Times,serif;background:white} .header{text-align:center;padding:36pt 56pt 10pt} .name{font-size:22pt;font-weight:700;color:#1e293b;margin-bottom:4pt} .contact{font-size:9.5pt;color:#475569} .rule{border:none;border-top:1pt solid #1e293b;margin:8pt 0 0} .cols{display:table;width:100%;table-layout:fixed} .sidebar{display:table-cell;width:30%;background:#f8fafc;border-right:.75pt solid #e2e8f0;padding:14pt 14pt;vertical-align:top} .main{display:table-cell;padding:14pt 20pt;vertical-align:top} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1e293b;border-bottom:.5pt solid #94a3b8;padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#1e293b;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:#475569;margin:2pt 0} .sidebar .bullet{font-size:9pt;color:#475569;margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1e293b;border-bottom:.75pt solid #1e293b;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#1e293b;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#334155;margin:2pt 0} .main .bullet{font-size:10pt;color:#334155;margin:2pt 0 2pt 14pt}`;
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
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:#DC2626;padding:26pt 40pt 18pt} .name{font-size:26pt;font-weight:900;color:white;letter-spacing:-.5pt} .contact{font-size:9.5pt;color:rgba(255,255,255,.85);margin-top:4pt} .cols{display:table;width:100%;table-layout:fixed} .sidebar{display:table-cell;width:30%;background:#1f2937;padding:16pt 14pt;vertical-align:top} .main{display:table-cell;padding:16pt 24pt;vertical-align:top} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#f87171;border-bottom:.5pt solid rgba(248,113,113,.3);padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#fecaca;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#DC2626;border-bottom:1pt solid #DC2626;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
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
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:#1D4ED8;padding:28pt 40pt 20pt} .name{font-size:26pt;font-weight:900;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .cols{display:table;width:100%;table-layout:fixed} .sidebar{display:table-cell;width:26%;background:#1e3a8a;padding:18pt 14pt;vertical-align:top} .main{display:table-cell;padding:18pt 28pt;vertical-align:top} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#93c5fd;border-bottom:.5pt solid rgba(147,197,253,.25);padding-bottom:2pt;margin:14pt 0 6pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#dbeafe;margin:8pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#1D4ED8;border-bottom:1pt solid #1D4ED8;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
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
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .cols{display:table;width:100%;table-layout:fixed} .sidebar{display:table-cell;width:30%;background:#064e3b;padding:26pt 16pt;vertical-align:top} .main{display:table-cell;padding:26pt 24pt;vertical-align:top} .sidebar .sname{font-size:18pt;font-weight:800;color:white;margin-bottom:3pt} .sidebar .contact{font-size:8.5pt;color:rgba(255,255,255,.7);margin-bottom:14pt} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#6ee7b7;border-bottom:.5pt solid rgba(110,231,183,.25);padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#d1fae5;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:rgba(255,255,255,.8);margin:2pt 0} .sidebar .bullet{font-size:9pt;color:rgba(255,255,255,.75);margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#059669;border-bottom:1pt solid #059669;padding-bottom:2pt;margin:12pt 0 6pt} .main .title{font-size:10.5pt;font-weight:700;color:#111827;margin:7pt 0 1pt} .main .text{font-size:9.5pt;color:#374151;margin:2pt 0} .main .bullet{font-size:9.5pt;color:#374151;margin:2pt 0 2pt 13pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, TECH_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, TECH_SIDEBAR_KEYS));
      body = `<div class="cols"><div class="sidebar"><div class="sname">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p>${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }

    // ── Entry Level ATS ───────────────────────────────────────────────────────
    case "entry": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:linear-gradient(135deg,#854d0e,#ca8a04);padding:28pt 48pt 20pt} .name{font-size:24pt;font-weight:800;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .body{padding:18pt 48pt} .sh{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#ca8a04;border-bottom:1pt solid #ca8a04;padding-bottom:2pt;margin:14pt 0 6pt} .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .text{font-size:10pt;color:#374151;margin:2pt 0} .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="body">${sections2html(r.sections)}</div>`;
      break;
    }

    // ── Entry Two-Column ──────────────────────────────────────────────────────
    case "entry-2col": {
      css = `${BASE_CSS} body{font-family:Arial,Helvetica,sans-serif;background:white} .header{background:linear-gradient(135deg,#854d0e,#ca8a04);padding:26pt 40pt 18pt} .name{font-size:24pt;font-weight:800;color:white} .contact{font-size:9.5pt;color:rgba(255,255,255,.8);margin-top:4pt} .cols{display:table;width:100%;table-layout:fixed} .sidebar{display:table-cell;width:30%;background:#fefce8;border-right:.75pt solid #fef9c3;padding:16pt 14pt;vertical-align:top} .main{display:table-cell;padding:16pt 24pt;vertical-align:top} .sidebar .sh{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#ca8a04;border-bottom:.5pt solid #fef08a;padding-bottom:2pt;margin:12pt 0 5pt} .sidebar .title{font-size:9.5pt;font-weight:700;color:#713f12;margin:7pt 0 1pt} .sidebar .text{font-size:9pt;color:#a16207;margin:2pt 0} .sidebar .bullet{font-size:9pt;color:#a16207;margin:2pt 0 2pt 12pt} .main .sh{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5pt;color:#ca8a04;border-bottom:1pt solid #ca8a04;padding-bottom:2pt;margin:14pt 0 7pt} .main .title{font-size:11pt;font-weight:700;color:#111827;margin:8pt 0 1pt} .main .text{font-size:10pt;color:#374151;margin:2pt 0} .main .bullet{font-size:10pt;color:#374151;margin:2pt 0 2pt 14pt}`;
      const sb = r.sections.filter(s => inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
      const mn = r.sections.filter(s => !inSidebar(s.header, ENTRY_SIDEBAR_KEYS));
      body = `<div class="header"><div class="name">${esc(r.name)}</div><p class="contact">${esc(r.contact)}</p></div><div class="cols"><div class="sidebar">${sections2htmlPrefixed(sb, "sidebar ")}</div><div class="main">${sections2htmlPrefixed(mn, "main ")}</div></div>`;
      break;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(r.name)} – Resume</title><style>${css}</style></head><body>${body}</body></html>`;
}
