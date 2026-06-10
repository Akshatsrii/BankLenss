/**
 * useTransactions.js
 *
 * Fetches transactions from the listTransactions callable.
 * Re-fetches whenever filters change.
 * Handles loading, error, and empty states.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const listTransactionsFn = httpsCallable(functions, "listTransactions");

/**
 * Validates filter combinations before sending to backend
 * Returns { valid: bool, warning: string|null }
 */
function validateFilters(filters) {
  const min = parseFloat(filters.minAmount);
  const max = parseFloat(filters.maxAmount);

  if (
    filters.minAmount &&
    filters.maxAmount &&
    !isNaN(min) &&
    !isNaN(max) &&
    min > max
  ) {
    return {
      valid: false,
      warning: "Min amount cannot be greater than max amount.",
    };
  }

  if (
    filters.from &&
    filters.to &&
    filters.from > filters.to
  ) {
    return {
      valid: false,
      warning: "Start date cannot be after end date.",
    };
  }

  return { valid: true, warning: null };
}

export function useTransactions(filters) {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [warning, setWarning]   = useState(null);

  // Abort previous request if filters change quickly
  const abortRef = useRef(false);

  const fetchTransactions = useCallback(async () => {
    // Validate first
    const { valid, warning: warn } = validateFilters(filters);
    setWarning(warn);

    if (!valid) {
      setData([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    setError(null);
    abortRef.current = false;

    try {
      // Build params — omit empty/default values
      const params = {
        page:     filters.page,
        pageSize: filters.pageSize,
      };

      if (filters.from)      params.from      = filters.from;
      if (filters.to)        params.to        = filters.to;
      if (filters.minAmount) params.minAmount = parseFloat(filters.minAmount);
      if (filters.maxAmount) params.maxAmount = parseFloat(filters.maxAmount);
      if (filters.search)    params.search    = filters.search;
      if (filters.type && filters.type !== "all") {
        params.type = filters.type;
      }

      const response = await listTransactionsFn(params);

      if (abortRef.current) return; // stale response

      const result = response.data;
      setData(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);

    } catch (err) {
      if (abortRef.current) return;
      console.error("[useTransactions] Error:", err);
      setError(err.message || "Failed to load transactions.");
      setData([]);
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
    return () => { abortRef.current = true; };
  }, [fetchTransactions]);

  return { data, total, totalPages, loading, error, warning, refetch: fetchTransactions };
}