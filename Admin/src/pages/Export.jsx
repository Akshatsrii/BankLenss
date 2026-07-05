import { useState } from "react";
import { Download, FileDown } from "lucide-react";

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";

const FORMATS = [
  {
    id: "csv",
    label: "CSV",
    desc: "Comma-separated values — works with Excel, Google Sheets",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "pdf",
    label: "PDF Report",
    desc: "Formatted statement with charts — ready to share or print",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15v-4h2a2 2 0 010 4H9zM13 11h2v4h-2zM13 13h2" />
      </svg>
    ),
  },
  {
    id: "json",
    label: "JSON",
    desc: "Structured data for developers and API integrations",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "xlsx",
    label: "Excel (.xlsx)",
    desc: "Native Excel workbook with formatting and formulas",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9M7 13l4 4M11 13l-4 4" />
      </svg>
    ),
  },
];

const DATE_RANGES = ["Last 30 days", "Last 3 months", "Last 6 months", "This year", "Custom range"];

const FIELDS = [
  "Date", "Description", "Amount", "Category", "Type", "Balance", "Reference No.", "Bank Name",
];

export default function Export() {
  const [format, setFormat] = useState("csv");
  const [range, setRange] = useState("Last 3 months");
  const [fields, setFields] = useState(["Date", "Description", "Amount", "Category", "Type"]);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleField = (f) =>
    setFields((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const handleExport = () => {
    setExporting(true);
    setDone(false);
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 1800);
  };

  return (
    <div
      className="min-h-screen px-6 py-8 relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes livePulse {
          0%   { box-shadow: 0 0 0 0 ${GREEN}66; }
          70%  { box-shadow: 0 0 0 6px ${GREEN}00; }
          100% { box-shadow: 0 0 0 0 ${GREEN}00; }
        }
      `}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, #60A5FA0D, transparent 70%)` }}
      />

      <div className="relative">
        {/* Header */}
        <div
          className="mb-8 flex items-center gap-3"
          style={{ animation: "fadeUp 0.45s ease both" }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4.5s ease-in-out infinite",
            }}
          >
            <FileDown size={19} style={{ color: GOLD_SOFT }} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>Data</p>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Fraunces', serif", color: TEXT }}
            >
              Export
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl relative">
          {/* Format Picker */}
          <div
            className="rounded-xl p-5 transition-shadow duration-300"
            style={{
              backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
              animation: "fadeUp 0.5s ease both", animationDelay: "60ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: GOLD_SOFT }}>
              Format
            </p>
            <div className="space-y-2">
              {FORMATS.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200"
                  style={{
                    borderColor: format === f.id ? `${GOLD}55` : BORDER_SOFT,
                    backgroundColor: format === f.id ? `${GOLD}12` : "rgba(255,255,255,0.01)",
                    color: format === f.id ? TEXT : TEXT_FAINT,
                    animation: "fadeUp 0.4s ease both",
                    animationDelay: `${100 + i * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    if (format !== f.id) e.currentTarget.style.borderColor = "#2A3040";
                  }}
                  onMouseLeave={(e) => {
                    if (format !== f.id) e.currentTarget.style.borderColor = BORDER_SOFT;
                  }}
                >
                  <span style={{ color: format === f.id ? GOLD_SOFT : TEXT_FAINT }}>
                    {f.icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-medium mb-0.5">{f.label}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: TEXT_FAINT }}>{f.desc}</p>
                  </div>
                  {format === f.id && (
                    <span className="ml-auto mt-0.5">
                      <svg className="w-4 h-4" style={{ color: GOLD_SOFT }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Date Range */}
            <div
              className="rounded-xl p-5 transition-shadow duration-300"
              style={{
                backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
                animation: "fadeUp 0.5s ease both", animationDelay: "120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: GOLD_SOFT }}>
                Date Range
              </p>
              <div className="flex flex-wrap gap-2">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className="px-3 py-1.5 rounded-md text-[11px] border transition-all duration-200"
                    style={{
                      borderColor: range === r ? `${GOLD}55` : BORDER_SOFT,
                      backgroundColor: range === r ? `${GOLD}12` : "transparent",
                      color: range === r ? GOLD_SOFT : TEXT_FAINT,
                    }}
                    onMouseEnter={(e) => {
                      if (range !== r) e.currentTarget.style.color = TEXT_DIM;
                    }}
                    onMouseLeave={(e) => {
                      if (range !== r) e.currentTarget.style.color = TEXT_FAINT;
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div
              className="rounded-xl p-5 transition-shadow duration-300"
              style={{
                backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
                animation: "fadeUp 0.5s ease both", animationDelay: "180ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: GOLD_SOFT }}>
                Fields to include
              </p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                {FIELDS.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggleField(f)}
                      className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        borderColor: fields.includes(f) ? GOLD : "rgba(255,255,255,0.2)",
                        backgroundColor: fields.includes(f) ? GOLD : "transparent",
                      }}
                    >
                      {fields.includes(f) && (
                        <svg className="w-2.5 h-2.5" style={{ color: INK }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-[11px] transition-colors"
                      style={{ color: fields.includes(f) ? TEXT_DIM : TEXT_FAINT }}
                      onClick={() => toggleField(f)}
                    >
                      {f}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary + Export Button */}
            <div
              className="rounded-xl p-5 transition-shadow duration-300"
              style={{
                backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
                animation: "fadeUp 0.5s ease both", animationDelay: "240ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: TEXT_FAINT }}>
                <span>Format</span>
                <span className="uppercase" style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{format}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: TEXT_FAINT }}>
                <span>Range</span>
                <span style={{ color: TEXT_DIM }}>{range}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] mb-4" style={{ color: TEXT_FAINT }}>
                <span>Fields</span>
                <span style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{fields.length} selected</span>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting || fields.length === 0}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden"
                style={
                  done
                    ? { backgroundColor: `${GREEN}20`, border: `1px solid ${GREEN}40`, color: GREEN }
                    : exporting
                    ? { backgroundColor: `${GOLD}14`, border: `1px solid ${GOLD}30`, color: GOLD_SOFT, cursor: "wait" }
                    : fields.length === 0
                    ? { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#3A4152", cursor: "not-allowed" }
                    : { backgroundColor: GOLD, border: `1px solid ${GOLD}`, color: INK }
                }
                onMouseEnter={(e) => {
                  if (!exporting && !done && fields.length > 0) e.currentTarget.style.backgroundColor = GOLD_SOFT;
                }}
                onMouseLeave={(e) => {
                  if (!exporting && !done && fields.length > 0) e.currentTarget.style.backgroundColor = GOLD;
                }}
              >
                {done ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                    Downloaded!
                  </>
                ) : exporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0110 10" /></svg>
                    Preparing…
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Small footer accent, consistent with Dashboard / Analytics */}
        <div
          className="flex items-center justify-center gap-2 pt-8 pb-1 text-[11px]"
          style={{ color: TEXT_FAINT, animation: "fadeUp 0.55s ease both", animationDelay: "320ms" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: GREEN, animation: "livePulse 2s infinite" }}
          />
          Ledger exports · encrypted end-to-end
        </div>
      </div>
    </div>
  );
}