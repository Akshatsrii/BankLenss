/**
 * Transactions.jsx
 *
 * Full transactions page:
 * - Filter bar (date, amount, type, search)
 * - Active filter chips with X to remove
 * - Reset filters button
 * - URL sync (filters preserved on refresh, shareable links)
 * - Transaction table with pagination
 * - Warning for invalid filter combinations
 */

import { useCallback } from "react";
import { AlertTriangle } from "lucide-react";

import { useFilterParams } from "../hooks/useFilterParams";
import { useTransactions } from "../hooks/useTransactions";
import FilterBar from "../components/FilterBar";
import FilterChips from "../components/FilterChips";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeChips,
  } = useFilterParams();

  const {
    data,
    total,
    totalPages,
    loading,
    error,
    warning,
  } = useTransactions(filters);

  const handlePageChange = useCallback((newPage) => {
    setFilters({ page: newPage });
  }, [setFilters]);

  const handleRemoveChip = useCallback((key) => {
    setFilter(key, "");
  }, [setFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Transactions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Filter, search, and browse your extracted transactions.
            </p>
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
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

      </div>
    </div>
  );
}