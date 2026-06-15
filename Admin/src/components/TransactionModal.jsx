/**
 * TransactionModal.jsx
 * Full detail modal when clicking a transaction row
 */

import { X, Copy, CheckCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useState } from "react";

const CATEGORY_COLORS = {
  Food:       "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Salary:     "text-green-400  bg-green-500/10  border-green-500/20",
  Rent:       "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Utility:    "text-cyan-400   bg-cyan-500/10   border-cyan-500/20",
  Shopping:   "text-pink-400   bg-pink-500/10   border-pink-500/20",
  Transport:  "text-amber-400  bg-amber-500/10  border-amber-500/20",
  ATM:        "text-slate-400  bg-slate-500/10  border-slate-500/20",
  Investment: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  Health:     "text-red-400    bg-red-500/10    border-red-500/20",
  Transfer:   "text-teal-400   bg-teal-500/10   border-teal-500/20",
  Other:      "text-slate-400  bg-slate-500/10  border-slate-500/20",
};

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-800 last:border-0">
      <span className="text-xs text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-sm text-slate-200 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function TransactionModal({ transaction, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const amount   = transaction.type === "credit" ? transaction.credit : transaction.debit;
  const catClass = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS.Other;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl
                   w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              transaction.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
            }`}>
              {transaction.type === "credit"
                ? <ArrowUpCircle   size={16} className="text-green-400" />
                : <ArrowDownCircle size={16} className="text-red-400"   />
              }
            </div>
            <span className="text-sm font-semibold text-white">Transaction Detail</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount hero */}
        <div className="px-5 py-6 text-center border-b border-slate-800">
          <p className={`text-4xl font-bold tabular-nums ${
            transaction.type === "credit" ? "text-green-400" : "text-red-400"
          }`}>
            {transaction.type === "credit" ? "+" : "-"}
            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-500 text-sm mt-1">{transaction.date}</p>
        </div>

        {/* Details */}
        <div className="px-5 py-2">
          {/* Description with copy */}
          <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-wider shrink-0">Description</span>
            <div className="flex items-start gap-2">
              <span className="text-sm text-slate-200 text-right leading-relaxed">
                {transaction.description}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
                title="Copy description"
              >
                {copied
                  ? <CheckCircle size={14} className="text-green-400" />
                  : <Copy        size={14} />
                }
              </button>
            </div>
          </div>

          <Row label="Type"    value={transaction.type === "credit" ? "Credit" : "Debit"} />
          <Row label="Balance" value={`₹${transaction.balance?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} mono />

          {/* Category */}
          <div className="flex items-center justify-between py-3 border-b border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Category</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catClass}`}>
              {transaction.category || "Other"}
            </span>
          </div>

          {transaction.statementId && (
            <Row label="Statement ID" value={transaction.statementId.slice(0, 16) + "…"} mono />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-700
                       text-slate-400 hover:text-slate-200 hover:bg-slate-800
                       text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}