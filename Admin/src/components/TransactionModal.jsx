/**
 * TransactionModal.jsx
 * Full detail modal when clicking a transaction row
 */

import { X, Copy, CheckCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useState } from "react";

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
    <div
      className="flex items-start justify-between gap-4 py-3 last:border-0"
      style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
    >
      <span className="text-xs uppercase tracking-wider shrink-0" style={{ color: TEXT_FAINT }}>{label}</span>
      <span
        className={`text-sm text-right ${mono ? "font-mono" : ""}`}
        style={{ color: TEXT }}
      >
        {value}
      </span>
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
  const isCredit = transaction.type === "credit";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl"
        style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, fontFamily: "'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: isCredit ? `${GREEN}1A` : `${RED}1A` }}
            >
              {isCredit
                ? <ArrowUpCircle   size={16} style={{ color: GREEN }} />
                : <ArrowDownCircle size={16} style={{ color: RED }} />
              }
            </div>
            <span className="text-sm font-semibold" style={{ color: TEXT, fontFamily: "'Fraunces', serif" }}>
              Transaction Detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="transition-colors duration-200"
            style={{ color: TEXT_FAINT }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount hero */}
        <div className="px-5 py-6 text-center" style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: isCredit ? GREEN : RED }}
          >
            {isCredit ? "+" : "-"}
            ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm mt-1" style={{ color: TEXT_FAINT }}>{transaction.date}</p>
        </div>

        {/* Details */}
        <div className="px-5 py-2">
          {/* Description with copy */}
          <div
            className="flex items-start justify-between gap-4 py-3"
            style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
          >
            <span className="text-xs uppercase tracking-wider shrink-0" style={{ color: TEXT_FAINT }}>
              Description
            </span>
            <div className="flex items-start gap-2">
              <span className="text-sm text-right leading-relaxed" style={{ color: TEXT }}>
                {transaction.description}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 transition-colors duration-200 mt-0.5"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = TEXT_DIM; }}
                onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = TEXT_FAINT; }}
                title="Copy description"
              >
                {copied
                  ? <CheckCircle size={14} style={{ color: GREEN }} />
                  : <Copy        size={14} />
                }
              </button>
            </div>
          </div>

          <Row label="Type"    value={isCredit ? "Credit" : "Debit"} />
          <Row label="Balance" value={`₹${transaction.balance?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} mono />

          {/* Category */}
          <div
            className="flex items-center justify-between py-3"
            style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
          >
            <span className="text-xs uppercase tracking-wider" style={{ color: TEXT_FAINT }}>Category</span>
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
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
            style={{ border: `1px solid ${BORDER_SOFT}`, color: TEXT_FAINT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = TEXT_DIM;
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = `${GOLD}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = TEXT_FAINT;
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = BORDER_SOFT;
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}