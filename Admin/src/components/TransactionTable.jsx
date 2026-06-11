/**
 * TransactionTable.jsx
 *
 * Renders paginated transaction rows.
 * Handles loading skeleton, empty state, and error state.
 *
 * Props:
 *   data              - transaction[]
 *   loading           - bool
 *   error             - string | null
 *   total             - number
 *   page              - number
 *   pageSize          - number
 *   totalPages        - number
 *   onPageChange      - (page: number) => void
 *   onPageSizeChange  - (size: number) => void
 */

import {
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

// ── Amount formatter ───────────────────────────────────────────
function formatAmount(amount) {
  if (!amount || amount === 0) return "—";
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Skeleton row ───────────────────────────────────────────────
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

// ── Page number button ─────────────────────────────────────────
function PageBtn({ p, current, onPageChange, disabled }) {
  return (
    <button
      onClick={() => onPageChange(p)}
      disabled={disabled}
      className={`min-w-[32px] h-8 rounded-lg text-sm font-medium
                  transition-colors disabled:cursor-not-allowed
                  ${
                    p === current
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
    >
      {p}
    </button>
  );
}

// ── Pagination ─────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  const delta = 2;
  const left  = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  const pages = [];
  for (let p = left; p <= right; p++) pages.push(p);

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || disabled}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200
                   hover:bg-slate-800 disabled:opacity-30
                   disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* First page + ellipsis */}
      {left > 1 && (
        <>
          <PageBtn
            p={1}
            current={page}
            onPageChange={onPageChange}
            disabled={disabled}
          />
          {left > 2 && (
            <span className="text-slate-600 px-1 text-sm">…</span>
          )}
        </>
      )}

      {/* Page window */}
      {pages.map((p) => (
        <PageBtn
          key={p}
          p={p}
          current={page}
          onPageChange={onPageChange}
          disabled={disabled}
        />
      ))}

      {/* Last page + ellipsis */}
      {right < totalPages && (
        <>
          {right < totalPages - 1 && (
            <span className="text-slate-600 px-1 text-sm">…</span>
          )}
          <PageBtn
            p={totalPages}
            current={page}
            onPageChange={onPageChange}
            disabled={disabled}
          />
        </>
      )}

      {/* Next */}
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

// ── Column definitions ─────────────────────────────────────────
// className controls responsive visibility
const HEADERS = [
  { label: "Date",        className: "" },
  { label: "Description", className: "" },
  { label: "Debit",       className: "" },
  { label: "Credit",      className: "" },
  { label: "Balance",     className: "hidden md:table-cell" },
  { label: "Type",        className: "hidden sm:table-cell" },
];

// ── Main component ─────────────────────────────────────────────
export default function TransactionTable({
  data,
  loading,
  error,
  total,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-2xl border border-red-500/20 bg-red-500/5
                   p-8 text-center"
      >
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  const showBottomBar = totalPages > 1 || !!onPageSizeChange;

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden">

      {/* ── Scrollable table ───────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">

          {/* Sticky header */}
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-800 bg-slate-900">
              {HEADERS.map((h) => (
                <th
                  key={h.label}
                  className={`px-4 py-3 text-left text-xs font-semibold
                              text-slate-500 uppercase tracking-wider
                              whitespace-nowrap ${h.className}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-slate-950 divide-y divide-slate-800/50">

            {/* Loading skeletons — only when no data yet */}
            {loading && data.length === 0 &&
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            }

            {/* Empty state */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-16 text-center">
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
                <td className="px-4 py-3.5 text-slate-400
                               whitespace-nowrap font-mono text-xs">
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

                {/* Balance — hidden on mobile */}
                <td
                  className="px-4 py-3.5 whitespace-nowrap
                             text-slate-400 font-mono text-xs
                             hidden md:table-cell"
                >
                  {formatAmount(t.balance)}
                </td>

                {/* Type badge — hidden on small screens */}
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1
                                rounded-full text-xs font-medium
                                ${
                                  t.type === "credit"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10  text-red-400"
                                }`}
                  >
                    {t.type === "credit" ? (
                      <ArrowUpCircle size={11} />
                    ) : (
                      <ArrowDownCircle size={11} />
                    )}
                    {t.type === "credit" ? "Credit" : "Debit"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom bar: page size + count + pagination ─────── */}
      {showBottomBar && (
        <div
          className="border-t border-slate-800 px-4 py-3 bg-slate-900/50
                     flex items-center justify-between gap-4 flex-wrap"
        >
          {/* Page size selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg
                           px-2 py-1 text-sm text-slate-200 outline-none
                           focus:border-blue-500 cursor-pointer"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Total count */}
          <span className="text-xs text-slate-500">
            {total} transaction{total !== 1 ? "s" : ""}
          </span>

          {/* Pagination */}
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