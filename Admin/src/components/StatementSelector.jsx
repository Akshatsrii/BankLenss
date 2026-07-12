/**
 * StatementSelector.jsx
 *
 * Dropdown to switch between uploaded statements.
 * "All Statements" option shows transactions from every statement.
 */

import { useState, useEffect } from "react";
import { listStatements as listStatementsFn } from "../services/api";
import { FileText, ChevronDown, Loader2 } from "lucide-react";

const INK        = "#0A0E17";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_FAINT = "#5F6678";
const RED        = "#F87171";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export default function StatementSelector({
  value,
  onChange,
}) {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await listStatementsFn();
        setStatements(res.data.data || []);
      } catch (err) {
        console.error("[StatementSelector]", err);
        setError("Could not load statements.");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_FAINT, fontFamily: "'Inter', sans-serif" }}>
        <Loader2 size={14} className="animate-spin" style={{ color: GOLD_SOFT }} />
        Loading statements...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm" style={{ color: RED, fontFamily: "'Inter', sans-serif" }}>{error}</p>;
  }

  if (statements.length === 0) {
    return (
      <p className="text-sm" style={{ color: TEXT_FAINT, fontFamily: "'Inter', sans-serif" }}>
        No statements uploaded yet.{" "}
        <a href="/upload" className="hover:underline" style={{ color: GOLD_SOFT }}>
          Upload one →
        </a>
      </p>
    );
  }

  const selected = statements.find((s) => s.statementId === value);

  return (
    <div className="relative w-full max-w-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: TEXT_FAINT }}
      >
        <FileText size={15} />
      </div>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full appearance-none rounded-xl pl-9 pr-8 py-2.5
                   text-sm outline-none cursor-pointer transition-colors duration-200"
        style={{ backgroundColor: INK, border: `1px solid ${BORDER_SOFT}`, color: TEXT }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${GOLD}66`;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${GOLD}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = BORDER_SOFT;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <option value="">All Statements</option>
        {statements.map((s) => (
          <option key={s.statementId} value={s.statementId}>
            {s.bankName} — {s.fileName} ({s.transactionCount} txns · {formatDate(s.uploadedAt)})
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: TEXT_FAINT }}
      />
    </div>
  );
}