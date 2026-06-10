/**
 * TransactionTable.jsx
 *
 * Renders paginated transaction rows.
 * Handles loading skeleton, empty state, and error state.
 */

import { ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

// ── Amount formatter ──────────────────────────────────────────
function formatAmount(amount) {
  if (!amount || amount === 0) return "—";
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Loading skeleton row ──────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-800">
      {[40, 140, 90, 90, 90, 60].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 bg-slate-800 rounded animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Pagination ────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  for (let p = left; p <= right; p++) pages.push(p);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || disabled}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200
                   hover:bg-slate-800 disabled:opacity-30
                   disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {left > 1 && (
        <>
          <PageBtn p={1} current={page} onPageChange={onPageChange} disabled={disabled} />
          {left > 2 && <span className="text-slate-600 px-1 text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageBtn key={p} p={p} current={page} onPageChange={onPageChange} disabled={disabled} />
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="text-slate-600 px-1 text-sm">…</span>}
          <PageBtn p={totalPages} current={page} onPageChange={onPageChange} disabled={disabled} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || disabled}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200
                   hover:bg-slate-800 disabled:opacity-30
                   disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PageBtn({ p, current, onPageChange, disabled }) {
  return (
    <button
      onClick={() => onPageChange(p)}
      disabled={disabled}
      className={`min-w-[32px] h-8 rounded-lg text-sm font-medium
                  transition-colors disabled:cursor-not-allowed
                  ${p === current
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
    >
      {p}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────
export default function TransactionTable({
  data,
  loading,
  error,
  total,
  page,
  totalPages,
  onPageChange,
}) {
  const HEADERS = ["Date", "Description", "Debit", "Credit", "Balance", "Type"];

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5
                      p-8 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Header */}
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold
                             text-slate-500 uppercase tracking-wider
                             whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-slate-950 divide-y divide-slate-800/50">

            {/* Loading skeletons */}
            {loading && data.length === 0 &&
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            }

            {/* Empty state */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 text-sm">
                    No transactions found for these filters.
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    Try adjusting the date range or removing some filters.
                  </p>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {data.map((t, i) => (
              <tr
                key={t.transactionId || i}
                className="hover:bg-slate-900/40 transition-colors"
              >
                {/* Date */}
                <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap font-mono text-xs">
                  {t.date}
                </td>

                {/* Description */}
                <td className="px-4 py-3.5 text-slate-200 max-w-[280px]">
                  <p className="truncate" title={t.description}>
                    {t.description}
                  </p>
                </td>

                {/* Debit */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {t.debit > 0 ? (
                    <span className="text-red-400 font-mono text-xs">
                      {formatAmount(t.debit)}
                    </span>
                  ) : (
                    <span className="text-slate-700">—</span>
                  )}
                </td>

                {/* Credit */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {t.credit > 0 ? (
                    <span className="text-green-400 font-mono text-xs">
                      {formatAmount(t.credit)}
                    </span>
                  ) : (
                    <span className="text-slate-700">—</span>
                  )}
                </td>

                {/* Balance */}
                <td className="px-4 py-3.5 whitespace-nowrap
                               text-slate-400 font-mono text-xs">
                  {formatAmount(t.balance)}
                </td>

                {/* Type badge */}
                <td className="px-4 py-3.5">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                  rounded-full text-xs font-medium
                                  ${t.type === "credit"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                  }`}>
                    {t.type === "credit"
                      ? <ArrowUpCircle   size={11} />
                      : <ArrowDownCircle size={11} />
                    }
                    {t.type === "credit" ? "Credit" : "Debit"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-800 px-4 py-3 bg-slate-900/50">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}