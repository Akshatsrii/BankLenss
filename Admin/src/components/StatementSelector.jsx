/**
 * StatementSelector.jsx
 *
 * Dropdown to switch between uploaded statements.
 * "All Statements" option shows transactions from every statement.
 */

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { FileText, ChevronDown, Loader2 } from "lucide-react";

const listStatementsFn = httpsCallable(functions, "listStatements");

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
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 size={14} className="animate-spin" />
        Loading statements...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (statements.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        No statements uploaded yet.{" "}
        <a href="/upload" className="text-blue-400 hover:underline">
          Upload one →
        </a>
      </p>
    );
  }

  const selected = statements.find((s) => s.statementId === value);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute left-3 top-1/2 -translate-y-1/2
                      text-slate-500 pointer-events-none">
        <FileText size={15} />
      </div>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full appearance-none bg-slate-900 border border-slate-700
                   rounded-xl pl-9 pr-8 py-2.5
                   text-sm text-slate-200 outline-none
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                   cursor-pointer transition-colors"
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
        className="absolute right-3 top-1/2 -translate-y-1/2
                   text-slate-500 pointer-events-none"
      />
    </div>
  );
}