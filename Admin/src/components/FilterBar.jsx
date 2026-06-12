/**
 * FilterBar.jsx
 *
 * Contains all filter inputs:
 * - Date range (from / to)
 * - Min / max amount
 * - Description search (debounced 300ms)
 * - Type dropdown (All / Debit / Credit)
 * - Category dropdown (All / Salary / Food / Rent / ...)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";

const CATEGORIES = [
  "all", "Salary", "Food", "Rent", "Utility",
  "Shopping", "Transport", "ATM", "Investment",
  "Health", "Transfer", "Other",
];

function InputWrapper({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = `
  w-full bg-slate-900 border border-slate-700 rounded-lg
  px-3 py-2 text-sm text-slate-200 placeholder-slate-600
  outline-none focus:border-blue-500 focus:ring-1
  focus:ring-blue-500/30 transition-colors
  disabled:opacity-50
`;

export default function FilterBar({ filters, onFilterChange, disabled }) {

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef(null);

  // Sync local search if filters.search is reset externally
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounce search → only call onFilterChange after 300ms of no typing
  const handleSearchChange = useCallback((value) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange("search", value);
    }, 300);
  }, [onFilterChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Amount: only allow positive numbers
  const handleAmountChange = useCallback((key, value) => {
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      onFilterChange(key, value);
    }
  }, [onFilterChange]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Date From */}
        <InputWrapper label="From Date">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-slate-500 pointer-events-none"
            />
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onFilterChange("from", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </InputWrapper>

        {/* Date To */}
        <InputWrapper label="To Date">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-slate-500 pointer-events-none"
            />
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onFilterChange("to", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </InputWrapper>

        {/* Type dropdown */}
        <InputWrapper label="Type">
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => onFilterChange("type", e.target.value)}
              disabled={disabled}
              className={`${inputClass} appearance-none pr-8 cursor-pointer`}
            >
              <option value="all">All Transactions</option>
              <option value="debit">Debit Only</option>
              <option value="credit">Credit Only</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-500 pointer-events-none"
            />
          </div>
        </InputWrapper>

        {/* Category dropdown */}
        <InputWrapper label="Category">
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange("category", e.target.value)}
              disabled={disabled}
              className={`${inputClass} appearance-none pr-8 cursor-pointer`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-500 pointer-events-none"
            />
          </div>
        </InputWrapper>

        {/* Min Amount */}
        <InputWrapper label="Min Amount (₹)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2
                             text-slate-500 text-sm pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              value={filters.minAmount}
              min="0"
              step="0.01"
              placeholder="0.00"
              onChange={(e) => handleAmountChange("minAmount", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-7`}
            />
          </div>
        </InputWrapper>

        {/* Max Amount */}
        <InputWrapper label="Max Amount (₹)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2
                             text-slate-500 text-sm pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              value={filters.maxAmount}
              min="0"
              step="0.01"
              placeholder="Any"
              onChange={(e) => handleAmountChange("maxAmount", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-7`}
            />
          </div>
        </InputWrapper>

        {/* Search */}
        <InputWrapper label="Search Description">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              placeholder="e.g. ZOMATO, SALARY..."
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
            />
          </div>
        </InputWrapper>

      </div>
    </div>
  );
}