/**
 * useFilterParams.js
 *
 * Syncs filter state to/from URL query params.
 * Refresh preserves state. Links are shareable.
 *
 * Params managed:
 *   from, to, minAmount, maxAmount, type, search, page, pageSize, statementId
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULTS = {
  from:        "",
  to:          "",
  minAmount:   "",
  maxAmount:   "",
  type:        "all",
  search:      "",
  page:        1,
  pageSize:    20,
  statementId: "",   // ← added
};

export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current values from URL (fall back to defaults)
  const filters = useMemo(() => ({
    from:        searchParams.get("from")        || DEFAULTS.from,
    to:          searchParams.get("to")          || DEFAULTS.to,
    minAmount:   searchParams.get("minAmount")   || DEFAULTS.minAmount,
    maxAmount:   searchParams.get("maxAmount")   || DEFAULTS.maxAmount,
    type:        searchParams.get("type")        || DEFAULTS.type,
    search:      searchParams.get("search")      || DEFAULTS.search,
    page:        parseInt(searchParams.get("page"))     || DEFAULTS.page,
    pageSize:    parseInt(searchParams.get("pageSize")) || DEFAULTS.pageSize,
    statementId: searchParams.get("statementId") || DEFAULTS.statementId,  // ← added
  }), [searchParams]);

  /**
   * Update one or more filter values
   * Resets to page 1 unless page is explicitly set
   */
  const setFilters = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      // Reset to page 1 when filters change (not when only page changes)
      const isPageChange = Object.keys(updates).every((k) => k === "page");
      if (!isPageChange) {
        next.set("page", "1");
      }

      for (const [key, value] of Object.entries(updates)) {
        if (
          value === "" ||
          value === null ||
          value === undefined ||
          value === DEFAULTS[key]
        ) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      return next;
    }, { replace: true }); // replace so back button works naturally
  }, [setSearchParams]);

  /**
   * Set a single filter
   */
  const setFilter = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  /**
   * Returns true if any non-default filter is active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.from        !== DEFAULTS.from        ||
      filters.to          !== DEFAULTS.to          ||
      filters.minAmount   !== DEFAULTS.minAmount   ||
      filters.maxAmount   !== DEFAULTS.maxAmount   ||
      filters.type        !== DEFAULTS.type        ||
      filters.search      !== DEFAULTS.search      ||
      filters.statementId !== DEFAULTS.statementId  // ← added
    );
  }, [filters]);

  /**
   * List of active filters as chips
   * Each chip: { key, label, value }
   */
  const activeChips = useMemo(() => {
    const chips = [];

    if (filters.from)
      chips.push({ key: "from",        label: "From",      value: filters.from });
    if (filters.to)
      chips.push({ key: "to",          label: "To",        value: filters.to });
    if (filters.minAmount)
      chips.push({ key: "minAmount",   label: "Min ₹",     value: filters.minAmount });
    if (filters.maxAmount)
      chips.push({ key: "maxAmount",   label: "Max ₹",     value: filters.maxAmount });
    if (filters.type && filters.type !== "all")
      chips.push({ key: "type",        label: "Type",      value: filters.type });
    if (filters.search)
      chips.push({ key: "search",      label: "Search",    value: filters.search });
    if (filters.statementId)
      chips.push({ key: "statementId", label: "Statement", value: filters.statementId }); // ← added

    return chips;
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
    activeChips,
    DEFAULTS,
  };
}