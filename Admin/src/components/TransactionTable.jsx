/**
 * TransactionTable.jsx
 *
 * Renders paginated transaction rows.
 * Handles loading skeleton, empty state, and error state.
 * Includes reconciliation status badges and larger page capacities (up to 1000).
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
 *   onShowMatchDetails - (transaction: object) => void
 *   onCreateQuickMatch - (transaction: object) => void
 */

import {
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  HelpCircle,
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
    <tr style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}>
      {[40, 140, 90, 90, 90, 60, 80].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-3.5 rounded animate-pulse"
            style={{ width: w, backgroundColor: BORDER }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Page number button ─────────────────────────────────────────
function PageBtn({ p, current, onPageChange, disabled }) {
  const isCurrent = p === current;
  return (
    <button
      onClick={() => onPageChange(p)}
      disabled={disabled}
      className="min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed"
      style={{
        backgroundColor: isCurrent ? GOLD : "transparent",
        color: isCurrent ? INK : TEXT_FAINT,
      }}
      onMouseEnter={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.color = TEXT_DIM;
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrent) {
          e.currentTarget.style.color = TEXT_FAINT;
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
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

  const navBtnStyle = { color: TEXT_FAINT };

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || disabled}
        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        style={navBtnStyle}
        onMouseEnter={(e) => { if (page > 1 && !disabled) { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
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
            <span className="px-1 text-sm" style={{ color: "#3A4152" }}>…</span>
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
            <span className="px-1 text-sm" style={{ color: "#3A4152" }}>…</span>
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
        className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        style={navBtnStyle}
        onMouseEnter={(e) => { if (page < totalPages && !disabled) { e.currentTarget.style.color = TEXT_DIM; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Column definitions ─────────────────────────────────────────
const HEADERS = [
  { label: "Date",        className: "" },
  { label: "Description", className: "" },
  { label: "Debit",       className: "" },
  { label: "Credit",      className: "" },
  { label: "Balance",     className: "hidden md:table-cell" },
  { label: "Type",        className: "hidden sm:table-cell" },
  { label: "Reconciliation", className: "" },
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
  onShowMatchDetails,
  onCreateQuickMatch,
}) {
  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ border: `1px solid ${RED}30`, backgroundColor: `${RED}0D` }}
      >
        <p className="text-sm" style={{ color: RED }}>{error}</p>
      </div>
    );
  }

  const showBottomBar = totalPages > 1 || !!onPageSizeChange;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${BORDER}`, fontFamily: "'Inter', sans-serif" }}
    >

      {/* ── Scrollable table ───────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">

          {/* Sticky header */}
          <thead className="sticky top-0 z-10">
            <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
              {HEADERS.map((h) => (
                <th
                  key={h.label}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${h.className}`}
                  style={{ color: GOLD_SOFT }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody style={{ backgroundColor: INK }}>

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
                  <p className="text-sm" style={{ color: TEXT_FAINT }}>
                    No transactions found for these filters.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#3A4152" }}>
                    Try adjusting the date range or removing some filters.
                  </p>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {data.map((t, i) => (
              <tr
                key={t.transactionId || i}
                className="transition-colors duration-150"
                style={{ borderBottom: `1px solid ${BORDER_SOFT}` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {/* Date */}
                <td
                  className="px-4 py-3.5 whitespace-nowrap font-mono text-xs"
                  style={{ color: TEXT_FAINT }}
                >
                  {t.date}
                </td>

                {/* Description */}
                <td className="px-4 py-3.5 max-w-[280px]" style={{ color: TEXT }}>
                  <p className="truncate" title={t.description}>
                    {t.description}
                  </p>
                </td>

                {/* Debit */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {t.debit > 0 ? (
                    <span className="font-mono text-xs" style={{ color: RED }}>
                      {formatAmount(t.debit)}
                    </span>
                  ) : (
                    <span style={{ color: "#3A4152" }}>—</span>
                  )}
                </td>

                {/* Credit */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {t.credit > 0 ? (
                    <span className="font-mono text-xs" style={{ color: GREEN }}>
                      {formatAmount(t.credit)}
                    </span>
                  ) : (
                    <span style={{ color: "#3A4152" }}>—</span>
                  )}
                </td>

                {/* Balance — hidden on mobile */}
                <td
                  className="px-4 py-3.5 whitespace-nowrap font-mono text-xs hidden md:table-cell"
                  style={{ color: TEXT_FAINT }}
                >
                  {formatAmount(t.balance)}
                </td>

                {/* Type badge — hidden on small screens */}
                <td className="px-4 py-3.5 hidden sm:table-cell">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: t.type === "credit" ? `${GREEN}1A` : `${RED}1A`,
                      color: t.type === "credit" ? GREEN : RED,
                    }}
                  >
                    {t.type === "credit" ? (
                      <ArrowUpCircle size={11} />
                    ) : (
                      <ArrowDownCircle size={11} />
                    )}
                    {t.type === "credit" ? "Credit" : "Debit"}
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {t.status === "matched" ? (
                    <button
                      onClick={() => onShowMatchDetails && onShowMatchDetails(t)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 select-none"
                      style={{ backgroundColor: `${GREEN}14`, color: GREEN, border: `1px solid ${GREEN}30` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GREEN}22`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GREEN}14`)}
                    >
                      <CheckCircle size={11} />
                      Matched
                    </button>
                  ) : (
                    <button
                      onClick={() => onCreateQuickMatch && onCreateQuickMatch(t)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 select-none"
                      style={{ backgroundColor: `${GOLD}14`, color: GOLD_SOFT, border: `1px solid ${GOLD}30` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}22`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}14`)}
                      title="Click to quickly match / create ledger record"
                    >
                      <HelpCircle size={11} />
                      Unmatched
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom bar: page size + count + pagination ─────── */}
      {showBottomBar && (
        <div
          className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: `${SURFACE}80` }}
        >
          {/* Page size selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_FAINT }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg px-2 py-1 text-sm outline-none cursor-pointer transition-colors duration-150"
                style={{ backgroundColor: INK, border: `1px solid ${BORDER_SOFT}`, color: TEXT }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${GOLD}66`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = BORDER_SOFT)}
              >
                {[10, 25, 50, 100, 250, 500, 1000].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Total count */}
          <span className="text-xs" style={{ color: TEXT_FAINT }}>
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