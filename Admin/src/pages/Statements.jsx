/**
 * Statements.jsx
 *
 * Lists all uploaded statements for the current user.
 * Each row shows: Bank, File name, Date, Transaction count, View button.
 * View button links to /transactions?statementId=xxx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listStatements as listStatementsFn } from "../services/api";
import {
  FileText, Eye, Upload,
  TrendingUp, Calendar, Landmark,
} from "lucide-react";

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
const RED        = "#F87171";
const BLUE       = "#60A5FA";

// Bank badge colors kept distinct for quick scanning, warmed to sit in the ink/gold theme
const BANK_STYLES = {
  SBI:   { color: "#60A5FA", bg: "#60A5FA1A", border: "#60A5FA33" },
  HDFC:  { color: "#F87171", bg: "#F871711A", border: "#F8717133" },
  ICICI: { color: "#FB923C", bg: "#FB923C1A", border: "#FB923C33" },
  AXIS:  { color: "#A78BFA", bg: "#A78BFA1A", border: "#A78BFA33" },
};
const DEFAULT_BANK_STYLE = { color: TEXT_FAINT, bg: "rgba(255,255,255,0.06)", border: BORDER_SOFT };

const FONT_STACK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  @keyframes fadeUp    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
`;

/* Decorative "passbook stub" divider — a perforated ledger edge */
function PassbookDivider() {
  return (
    <div className="flex items-center gap-1.5 px-1 select-none" aria-hidden="true">
      {Array.from({ length: 46 }).map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "#232838" }} />
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
      {[80, 160, 100, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3.5 rounded animate-pulse"
               style={{ width: w, backgroundColor: BORDER_SOFT }} />
        </td>
      ))}
    </tr>
  );
}

export default function Statements() {
  const navigate = useNavigate();

  const [statements, setStatements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function fetchStatements() {
      try {
        const res = await listStatementsFn();
        setStatements(res.data.data || []);
      } catch (err) {
        setError("Failed to load statements. Please try again.");
        console.error("[Statements]", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatements();
  }, []);

  const handleView = (statementId) => {
    navigate(`/transactions?statementId=${statementId}`);
  };

  // ── Summary stats ──────────────────────────────────────────
  const totalTransactions = statements.reduce(
    (s, st) => s + (st.transactionCount || 0), 0
  );

  return (
    <div
      className="min-h-screen p-6 md:p-10 relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_STACK}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BLUE}0D, transparent 70%)` }}
      />

      <div className="max-w-5xl mx-auto space-y-6 relative">

        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 flex-wrap"
          style={{ animation: "fadeUp 0.45s ease both" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${GOLD}1A`,
                border: `1px solid ${GOLD}40`,
                animation: "floatSlow 4.5s ease-in-out infinite",
              }}
            >
              <FileText size={19} style={{ color: GOLD_SOFT }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>Archive</p>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                Statements
              </h1>
              <p className="text-sm mt-1" style={{ color: TEXT_FAINT }}>
                All your uploaded bank statements.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: GOLD, color: INK }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_SOFT)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <Upload size={15} />
            Upload New
          </button>
        </div>

        <PassbookDivider />

        {/* Stats */}
        {!loading && statements.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Statements", value: statements.length, icon: <FileText size={18} />, accent: GOLD_SOFT },
              { label: "Total Transactions", value: totalTransactions, icon: <TrendingUp size={18} />, accent: GREEN },
              { label: "Banks Connected", value: new Set(statements.map((s) => s.bankName)).size, icon: <Landmark size={18} />, accent: BLUE },
            ].map((stat, i) => (
              <div key={stat.label}
                   className="relative rounded-xl p-4 flex items-center gap-3 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                   style={{
                     backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
                     animation: "fadeUp 0.5s ease both", animationDelay: `${i * 70}ms`,
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 14px 30px -16px ${stat.accent}70`)}
                   onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <span
                  className="absolute -right-6 -top-6 w-16 h-16 rounded-full"
                  style={{ background: `radial-gradient(circle, ${stat.accent}22, transparent 70%)` }}
                />
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative"
                  style={{ backgroundColor: `${stat.accent}1A`, color: stat.accent }}
                >
                  {stat.icon}
                </div>
                <div className="relative">
                  <p className="text-xl font-bold" style={{ color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: TEXT_FAINT }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ border: `1px solid ${RED}33`, backgroundColor: `${RED}0D`, color: RED }}
          >
            {error}
          </div>
        )}

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden transition-shadow duration-300"
          style={{
            border: `1px solid ${BORDER}`,
            animation: "fadeUp 0.55s ease both", animationDelay: "220ms",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">

              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
                  {["Bank", "File Name", "Uploaded At", "Transactions", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: TEXT_FAINT }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody style={{ backgroundColor: "rgba(10,14,23,0.4)" }}>

                {/* Loading */}
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

                {/* Empty */}
                {!loading && statements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${GOLD}1A`, border: `1px solid ${GOLD}40` }}
                        >
                          <FileText size={24} style={{ color: GOLD_SOFT }} />
                        </div>
                        <p className="text-sm" style={{ color: TEXT_FAINT }}>
                          No statements uploaded yet.
                        </p>
                        <button
                          onClick={() => navigate("/upload")}
                          className="text-sm font-medium transition-colors"
                          style={{ color: GOLD_SOFT }}
                        >
                          Upload your first statement →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {statements.map((s, i) => {
                  const bankStyle = BANK_STYLES[s.bankName] || DEFAULT_BANK_STYLE;
                  return (
                    <tr key={s.statementId}
                        className="transition-colors"
                        style={{ borderTop: i ? `1px solid ${BORDER_SOFT}` : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#161B26")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >

                      {/* Bank badge */}
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ color: bankStyle.color, backgroundColor: bankStyle.bg, border: `1px solid ${bankStyle.border}` }}
                        >
                          {s.bankName}
                        </span>
                      </td>

                      {/* File name */}
                      <td className="px-4 py-4 max-w-[220px]" style={{ color: "#E4E6EB" }}>
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="shrink-0" style={{ color: TEXT_FAINT }} />
                          <span className="truncate text-sm" title={s.fileName}>
                            {s.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-xs whitespace-nowrap" style={{ color: TEXT_FAINT, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {formatDate(s.uploadedAt)}
                      </td>

                      {/* Count */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-sm"
                              style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>
                          <TrendingUp size={13} style={{ color: TEXT_FAINT }} />
                          {s.transactionCount}
                        </span>
                      </td>

                      {/* View button */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleView(s.statementId)}
                          className="flex items-center gap-1.5 px-3 py-1.5
                                     rounded-lg text-xs font-medium
                                     transition-all duration-200 whitespace-nowrap"
                          style={{ backgroundColor: `${GOLD}12`, border: `1px solid ${GOLD}33`, color: GOLD_SOFT }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}22`)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}12`)}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}