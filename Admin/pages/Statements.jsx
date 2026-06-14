/**
 * Statements.jsx
 *
 * Lists all uploaded statements for the current user.
 * Each row shows: Bank, File name, Date, Transaction count, View button.
 * View button links to /transactions?statementId=xxx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import {
  FileText, Eye, Loader2, Upload,
  TrendingUp, TrendingDown, Calendar,
} from "lucide-react";

const listStatementsFn = httpsCallable(functions, "listStatements");

const BANK_COLORS = {
  SBI:   "text-blue-400   bg-blue-500/10   border-blue-500/20",
  HDFC:  "text-red-400    bg-red-500/10    border-red-500/20",
  ICICI: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  AXIS:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      {[80, 160, 100, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3.5 bg-slate-800 rounded animate-pulse"
               style={{ width: w }} />
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Statements</h1>
            <p className="text-slate-400 text-sm mt-1">
              All your uploaded bank statements.
            </p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-blue-600 hover:bg-blue-500 text-white text-sm
                       font-medium transition-colors"
          >
            <Upload size={15} />
            Upload New
          </button>
        </div>

        {/* Stats */}
        {!loading && statements.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Statements", value: statements.length, icon: <FileText size={18} /> },
              { label: "Total Transactions", value: totalTransactions, icon: <TrendingUp size={18} /> },
              { label: "Banks Connected", value: new Set(statements.map((s) => s.bankName)).size, icon: <Calendar size={18} /> },
            ].map((stat) => (
              <div key={stat.label}
                   className="bg-slate-900 border border-slate-800
                              rounded-xl p-4 flex items-center gap-3">
                <div className="text-slate-500">{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl border border-red-500/20
                          bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">

              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  {["Bank", "File Name", "Uploaded At", "Transactions", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                           text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-slate-950 divide-y divide-slate-800/50">

                {/* Loading */}
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}

                {/* Empty */}
                {!loading && statements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={32} className="text-slate-700" />
                        <p className="text-slate-500 text-sm">
                          No statements uploaded yet.
                        </p>
                        <button
                          onClick={() => navigate("/upload")}
                          className="text-blue-400 hover:text-blue-300
                                     text-sm transition-colors"
                        >
                          Upload your first statement →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {statements.map((s) => (
                  <tr key={s.statementId}
                      className="hover:bg-slate-900/40 transition-colors">

                    {/* Bank badge */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1
                                        rounded-full text-xs font-semibold
                                        border ${BANK_COLORS[s.bankName] ||
                                          "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
                        {s.bankName}
                      </span>
                    </td>

                    {/* File name */}
                    <td className="px-4 py-4 text-slate-200 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-500 shrink-0" />
                        <span className="truncate text-sm" title={s.fileName}>
                          {s.fileName}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(s.uploadedAt)}
                    </td>

                    {/* Count */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1
                                        text-slate-300 text-sm font-mono">
                        <TrendingUp size={13} className="text-slate-500" />
                        {s.transactionCount}
                      </span>
                    </td>

                    {/* View button */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleView(s.statementId)}
                        className="flex items-center gap-1.5 px-3 py-1.5
                                   rounded-lg text-xs font-medium
                                   bg-blue-500/10 hover:bg-blue-500/20
                                   border border-blue-500/20 text-blue-400
                                   transition-colors whitespace-nowrap"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}