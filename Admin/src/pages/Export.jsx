import { useState } from "react";

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
      className="min-h-screen bg-[#080a12] text-slate-300 px-6 py-8"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1">Data</p>
        <h1
          className="text-2xl font-bold text-slate-100"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Export
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
        {/* Format Picker */}
        <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">
            Format
          </p>
          <div className="space-y-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150 ${
                  format === f.id
                    ? "border-blue-500/40 bg-blue-500/8 text-slate-100"
                    : "border-white/[0.05] bg-white/[0.01] text-slate-400 hover:border-white/10 hover:text-slate-300"
                }`}
              >
                <span className={format === f.id ? "text-blue-400" : "text-slate-600"}>
                  {f.icon}
                </span>
                <div>
                  <p className="text-[12px] font-medium mb-0.5">{f.label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
                {format === f.id && (
                  <span className="ml-auto mt-0.5">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">
              Date Range
            </p>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-md text-[11px] border transition-all duration-150 ${
                    range === r
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">
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
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                      fields.includes(f)
                        ? "border-blue-500 bg-blue-500"
                        : "border-white/20 bg-transparent group-hover:border-white/30"
                    }`}
                  >
                    {fields.includes(f) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[11px] transition-colors ${
                      fields.includes(f) ? "text-slate-300" : "text-slate-500"
                    }`}
                    onClick={() => toggleField(f)}
                  >
                    {f}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary + Export Button */}
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Format</span>
              <span className="text-slate-300 uppercase">{format}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Range</span>
              <span className="text-slate-300">{range}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
              <span>Fields</span>
              <span className="text-slate-300">{fields.length} selected</span>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting || fields.length === 0}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                done
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                  : exporting
                  ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 cursor-wait"
                  : fields.length === 0
                  ? "bg-white/5 border border-white/10 text-slate-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-400 text-white border border-blue-500"
              }`}
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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}