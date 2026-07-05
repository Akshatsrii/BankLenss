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

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_FAINT = "#5F6678";

const CATEGORIES = [
  "all", "Salary", "Food", "Rent", "Utility",
  "Shopping", "Transport", "ATM", "Investment",
  "Health", "Transfer", "Other",
];

function InputWrapper({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-[11px] font-medium uppercase tracking-wider"
        style={{ color: GOLD_SOFT }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputBaseStyle = {
  backgroundColor: INK,
  border: `1px solid ${BORDER_SOFT}`,
  color: TEXT,
  colorScheme: "dark",
};

const inputClass = `
  w-full rounded-lg px-3 py-2 text-sm
  outline-none transition-colors duration-200
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

  const focusRing = (e) => {
    e.currentTarget.style.borderColor = `${GOLD}66`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${GOLD}22`;
  };
  const blurRing = (e) => {
    e.currentTarget.style.borderColor = BORDER_SOFT;
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Date From */}
        <InputWrapper label="From Date">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_FAINT }}
            />
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => onFilterChange("from", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            />
          </div>
        </InputWrapper>

        {/* Date To */}
        <InputWrapper label="To Date">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_FAINT }}
            />
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => onFilterChange("to", e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
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
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            >
              <option value="all">All Transactions</option>
              <option value="debit">Debit Only</option>
              <option value="credit">Credit Only</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_FAINT }}
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
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_FAINT }}
            />
          </div>
        </InputWrapper>

        {/* Min Amount */}
        <InputWrapper label="Min Amount (₹)">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: TEXT_FAINT }}
            >
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
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            />
          </div>
        </InputWrapper>

        {/* Max Amount */}
        <InputWrapper label="Max Amount (₹)">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: TEXT_FAINT }}
            >
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
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            />
          </div>
        </InputWrapper>

        {/* Search */}
        <InputWrapper label="Search Description">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: TEXT_FAINT }}
            />
            <input
              type="text"
              value={localSearch}
              placeholder="e.g. ZOMATO, SALARY..."
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={disabled}
              className={`${inputClass} pl-8`}
              style={inputBaseStyle}
              onFocus={focusRing}
              onBlur={blurRing}
            />
          </div>
        </InputWrapper>

      </div>
    </div>
  );
}