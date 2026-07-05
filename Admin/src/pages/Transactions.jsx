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
import { AlertTriangle, X, CheckCircle, Calendar, Tag, Hash, FileText, HelpCircle } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header — title + export button + statement selector */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Transactions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Filter, search, and browse your extracted transactions.
            </p>
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
        <FilterBar
          filters={filters}
          onFilterChange={setFilter}
          disabled={loading}
        />

        {/* Conflict warning */}
        {warning && (
          <div className="flex items-center gap-2 px-4 py-3
                          rounded-xl border border-yellow-500/20
                          bg-yellow-500/5 text-yellow-400 text-sm">
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

      {/* Match Details Modal */}
      {selectedTx && selectedTx.matchedLedger && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12161F] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <CheckCircle size={18} className="text-emerald-500" /> Reconciliation Details
              </h2>
              <button onClick={() => setSelectedTx(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Matched with Internal Ledger Entry</p>
                  <p className="text-sm font-semibold text-slate-100">{selectedTx.matchedLedger.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> Expected Date</span>
                  <p className="font-mono text-slate-200">{selectedTx.matchedLedger.date}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Tag size={12} /> Category</span>
                  <p className="text-slate-200">{selectedTx.matchedLedger.category}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Hash size={12} /> Reference No</span>
                  <p className="font-mono text-slate-200">{selectedTx.matchedLedger.referenceNo || "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><FileText size={12} /> Amount</span>
                  <p className="font-mono font-bold text-emerald-400">₹{selectedTx.matchedLedger.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reconciliation Prompt */}
      {matchingTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12161F] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <HelpCircle size={18} className="text-blue-500" /> Reconcile Transaction
              </h2>
              <button onClick={() => setMatchingTx(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Would you like to match this statement transaction by adding it to your expected ledger book?
            </p>

            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-sm space-y-1.5">
              <p className="text-slate-200 font-medium truncate">{matchingTx.description}</p>
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>{matchingTx.date}</span>
                <span className={matchingTx.type === "credit" ? "text-green-400" : "text-red-400"}>
                  ₹{(matchingTx.credit || matchingTx.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {matchError && (
              <p className="text-xs text-red-400">{matchError}</p>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setMatchingTx(null)}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmQuickMatch}
                disabled={reconciling}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-40"
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