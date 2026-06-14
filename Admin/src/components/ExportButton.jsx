/**
 * ExportButton.jsx
 *
 * Downloads currently filtered transactions as a formatted .xlsx file.
 * Fetches ALL filtered results (pageSize=1000) so export isn't
 * limited to the current page.
 *
 * Uses SheetJS (xlsx) library.
 */

import { useState, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const listTransactionsFn = httpsCallable(functions, "listTransactions");

/**
 * Formats a number as Indian currency string
 */
function formatINR(amount) {
  if (!amount || amount === 0) return "";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Builds export filename from current filters
 */
function buildFilename(filters) {
  const parts = ["transactions"];
  if (filters.from) parts.push(`from-${filters.from}`);
  if (filters.to)   parts.push(`to-${filters.to}`);
  if (filters.type && filters.type !== "all") parts.push(filters.type);
  parts.push(new Date().toISOString().slice(0, 10));
  return parts.join("_") + ".xlsx";
}

export default function ExportButton({ filters, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch all filtered transactions (not paginated)
      const params = {
        page:     1,
        pageSize: 1000,
      };

      if (filters.from)        params.from        = filters.from;
      if (filters.to)          params.to          = filters.to;
      if (filters.minAmount)   params.minAmount   = parseFloat(filters.minAmount);
      if (filters.maxAmount)   params.maxAmount   = parseFloat(filters.maxAmount);
      if (filters.search)      params.search      = filters.search;
      if (filters.statementId) params.statementId = filters.statementId;
      if (filters.category && filters.category !== "all") params.category = filters.category;
      if (filters.type && filters.type !== "all")         params.type     = filters.type;

      const response = await listTransactionsFn(params);
      const transactions = response.data.data || [];

      if (transactions.length === 0) {
        alert("No transactions to export for the current filters.");
        return;
      }

      // ── Build worksheet data ─────────────────────────────────
      const rows = transactions.map((t, i) => ({
        "S.No":        i + 1,
        "Date":        t.date,
        "Description": t.description,
        "Debit (₹)":   t.debit  > 0 ? formatINR(t.debit)  : "",
        "Credit (₹)":  t.credit > 0 ? formatINR(t.credit) : "",
        "Balance (₹)": formatINR(t.balance),
        "Type":        t.type === "credit" ? "Credit" : "Debit",
        "Category":    t.category || "Other",
      }));

      // ── Create workbook ──────────────────────────────────────
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 6  },   // S.No
        { wch: 12 },   // Date
        { wch: 45 },   // Description
        { wch: 14 },   // Debit
        { wch: 14 },   // Credit
        { wch: 14 },   // Balance
        { wch: 10 },   // Type
        { wch: 14 },   // Category
      ];

      // Style header row (bold) — SheetJS community edition
      // doesn't support cell styles, but we set freeze pane
      ws["!freeze"] = { xSplit: 0, ySplit: 1 }; // freeze header row

      XLSX.utils.book_append_sheet(wb, ws, "Transactions");

      // ── Summary sheet ────────────────────────────────────────
      const totalDebit  = transactions.reduce((s, t) => s + t.debit,  0);
      const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);

      const summaryRows = [
        { "Metric": "Total Transactions", "Value": transactions.length },
        { "Metric": "Total Debit (₹)",    "Value": formatINR(totalDebit)  },
        { "Metric": "Total Credit (₹)",   "Value": formatINR(totalCredit) },
        { "Metric": "Net (₹)",            "Value": formatINR(totalCredit - totalDebit) },
        { "Metric": "Export Date",         "Value": new Date().toLocaleDateString("en-IN") },
        { "Metric": "Filters Applied",     "Value": JSON.stringify({
          from: filters.from || "—", to: filters.to || "—",
          type: filters.type, category: filters.category,
          search: filters.search || "—",
        })},
      ];

      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary["!cols"] = [{ wch: 22 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // ── Download ─────────────────────────────────────────────
      XLSX.writeFile(wb, buildFilename(filters));

    } catch (err) {
      console.error("[ExportButton] Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return (
    <button
      onClick={handleExport}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl
                 bg-green-600/15 hover:bg-green-600/25
                 border border-green-500/20 hover:border-green-500/40
                 text-green-400 text-sm font-medium
                 transition-colors disabled:opacity-40
                 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Download size={15} />
      )}
      {loading ? "Exporting..." : "Export Excel"}
    </button>
  );
}