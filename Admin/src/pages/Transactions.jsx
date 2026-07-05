/**
 * Transactions.jsx
 *
 * Full transactions page:
 * - Statement selector dropdown + Export button in header
 * - Filter bar (date, amount, type, category, search, status)
 * - Active filter chips with X to remove
 * - Reset filters button
 * - URL sync (filters preserved on refresh, shareable links)
 * - Transaction table with pagination + page size selector
 * - Warning for invalid filter combinations
 * - Matching details modal & quick reconciliation triggers
 */

import { useState, useCallback } from "react";
import { AlertTriangle, X, CheckCircle, Calendar, Tag, Hash, FileText, HelpCircle, Receipt } from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

import { useFilterParams }   from "../hooks/useFilterParams";
import { useTransactions }   from "../hooks/useTransactions";
import FilterBar             from "../components/FilterBar";
import FilterChips           from "../components/FilterChips";
import TransactionTable      from "../components/TransactionTable";
import StatementSelector     from "../components/StatementSelector";
import ExportButton          from "../components/ExportButton";

const addLedgerEntryFn = httpsCallable(functions, "addLedgerEntry");

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";
const RED        = "#F87171";
const YELLOW     = "#D9B65A";

const FONT_STACK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  @keyframes fadeUp    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes popIn     { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
`;

export default function Transactions() {
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    activeChips,
  } = useFilterParams();

  const {
    data,
    total,
    totalPages,
    loading,
    error,
    warning,
    refetch,
  } = useTransactions(filters);

  // Modals / Details State
  const [selectedTx, setSelectedTx] = useState(null);
  const [matchingTx, setMatchingTx] = useState(null);
  const [reconciling, setReconciling] = useState(false);
  const [matchError, setMatchError] = useState("");

  const handlePageChange = useCallback((newPage) => {
    setFilters({ page: newPage });
  }, [setFilters]);

  const handlePageSizeChange = useCallback((newSize) => {
    setFilters({ pageSize: newSize, page: 1 });
  }, [setFilters]);

  const handleRemoveChip = useCallback((key) => {
    setFilter(key, "");
  }, [setFilter]);

  const handleShowMatchDetails = useCallback((tx) => {
    setSelectedTx(tx);
  }, []);

  const handleCreateQuickMatch = useCallback((tx) => {
    setMatchingTx(tx);
    setMatchError("");
  }, []);

  const confirmQuickMatch = async () => {
    if (!matchingTx) return;

    setReconciling(true);
    setMatchError("");
    try {
      const amount = matchingTx.type === "credit" ? matchingTx.credit : matchingTx.debit;
      await addLedgerEntryFn({
        date: matchingTx.date,
        description: matchingTx.description,
        amount: amount,
        type: matchingTx.type,
        category: matchingTx.category || "Other",
        referenceNo: matchingTx.transactionId?.slice(0, 10) || "",
      });

      setMatchingTx(null);
      refetch();
    } catch (err) {
      console.error("[Transactions] Quick match failed:", err);
      setMatchError(err.message || "Failed to match. Please try again.");
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div
      className="min-h-screen p-6 md:p-10 font-sans relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_STACK}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, #60A5FA0D, transparent 70%)` }}
      />

      <div className="max-w-6xl mx-auto space-y-5 relative">

        {/* Header — title + export button + statement selector */}
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
              <Receipt size={19} style={{ color: GOLD_SOFT }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>Records</p>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                Transactions
              </h1>
              <p className="text-sm mt-1" style={{ color: TEXT_FAINT }}>
                Filter, search, and browse your extracted transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Export button */}
            <ExportButton filters={filters} disabled={loading} />

            {/* Statement selector */}
            <StatementSelector
              value={filters.statementId}
              onChange={(id) => setFilter("statementId", id || "")}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ animation: "fadeUp 0.5s ease both", animationDelay: "80ms" }}>
          <FilterBar
            filters={filters}
            onFilterChange={setFilter}
            disabled={loading}
          />
        </div>

        {/* Conflict warning */}
        {warning && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{
              border: `1px solid ${YELLOW}33`,
              backgroundColor: `${YELLOW}0D`,
              color: YELLOW,
              animation: "popIn 0.2s ease both",
            }}
          >
            <AlertTriangle size={15} className="shrink-0" />
            {warning}
          </div>
        )}

        {/* Active filter chips + result count */}
        <FilterChips
          chips={activeChips}
          onRemove={handleRemoveChip}
          onReset={resetFilters}
          total={total}
          loading={loading}
        />

        {/* Table */}
        <div style={{ animation: "fadeUp 0.55s ease both", animationDelay: "140ms" }}>
          <TransactionTable
            data={data}
            loading={loading}
            error={error}
            total={total}
            page={filters.page}
            pageSize={filters.pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onShowMatchDetails={handleShowMatchDetails}
            onCreateQuickMatch={handleCreateQuickMatch}
          />
        </div>

      </div>

      {/* Match Details Modal */}
      {selectedTx && selectedTx.matchedLedger && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, animation: "popIn 0.2s ease both" }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="text-lg font-semibold flex items-center gap-1.5" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                <CheckCircle size={18} style={{ color: GREEN }} /> Reconciliation Details
              </h2>
              <button
                onClick={() => setSelectedTx(null)}
                className="transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ backgroundColor: `${GREEN}0D`, border: `1px solid ${GREEN}1A` }}
              >
                <div className="space-y-1">
                  <p className="text-xs uppercase font-semibold" style={{ color: TEXT_FAINT }}>Matched with Internal Ledger Entry</p>
                  <p className="text-sm font-semibold" style={{ color: TEXT }}>{selectedTx.matchedLedger.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs flex items-center gap-1" style={{ color: TEXT_FAINT }}><Calendar size={12} /> Expected Date</span>
                  <p style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{selectedTx.matchedLedger.date}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs flex items-center gap-1" style={{ color: TEXT_FAINT }}><Tag size={12} /> Category</span>
                  <p style={{ color: TEXT_DIM }}>{selectedTx.matchedLedger.category}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs flex items-center gap-1" style={{ color: TEXT_FAINT }}><Hash size={12} /> Reference No</span>
                  <p style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{selectedTx.matchedLedger.referenceNo || "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs flex items-center gap-1" style={{ color: TEXT_FAINT }}><FileText size={12} /> Amount</span>
                  <p className="font-bold" style={{ color: GREEN, fontFamily: "'IBM Plex Mono', monospace" }}>
                    ₹{selectedTx.matchedLedger.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ backgroundColor: "#1B202B", color: TEXT_DIM }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#232838"; e.currentTarget.style.color = TEXT; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1B202B"; e.currentTarget.style.color = TEXT_DIM; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reconciliation Prompt */}
      {matchingTx && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, animation: "popIn 0.2s ease both" }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="text-lg font-semibold flex items-center gap-1.5" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                <HelpCircle size={18} style={{ color: GOLD_SOFT }} /> Reconcile Transaction
              </h2>
              <button
                onClick={() => setMatchingTx(null)}
                className="transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: TEXT_FAINT }}>
              Would you like to match this statement transaction by adding it to your expected ledger book?
            </p>

            <div
              className="rounded-xl p-3 text-sm space-y-1.5"
              style={{ backgroundColor: "rgba(10,14,23,0.5)", border: `1px solid ${BORDER}` }}
            >
              <p className="font-medium truncate" style={{ color: TEXT }}>{matchingTx.description}</p>
              <div className="flex justify-between text-xs" style={{ color: TEXT_FAINT, fontFamily: "'IBM Plex Mono', monospace" }}>
                <span>{matchingTx.date}</span>
                <span style={{ color: matchingTx.type === "credit" ? GREEN : RED }}>
                  ₹{(matchingTx.credit || matchingTx.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {matchError && (
              <p className="text-xs" style={{ color: RED }}>{matchError}</p>
            )}

            <div className="pt-3 flex items-center justify-end gap-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button
                onClick={() => setMatchingTx(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.backgroundColor = "#1B202B"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Cancel
              </button>
              <button
                onClick={confirmQuickMatch}
                disabled={reconciling}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40"
                style={{ backgroundColor: GOLD, color: INK }}
                onMouseEnter={(e) => { if (!reconciling) e.currentTarget.style.backgroundColor = GOLD_SOFT; }}
                onMouseLeave={(e) => { if (!reconciling) e.currentTarget.style.backgroundColor = GOLD; }}
              >
                {reconciling && (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0110 10" /></svg>
                )}
                {reconciling ? "Matching..." : "Confirm Match"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}