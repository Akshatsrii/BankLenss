/**
 * ExportButton.jsx
 *
 * Downloads currently filtered transactions as either a formatted .xlsx (Excel)
 * or a professionally designed .pdf file.
 *
 * Uses:
 * - SheetJS (xlsx) for Excel exports.
 * - jsPDF & jsPDF-AutoTable for PDF exports.
 */

import { useState, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { Loader2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const BORDER_SOFT= "#1B202B";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";

const listTransactionsFn = httpsCallable(functions, "listTransactions");

/**
 * Formats a number as Indian currency string
 */
function formatINR(amount) {
  if (amount === undefined || amount === null || amount === 0) return "";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Builds export filename from current filters
 */
function buildFilename(filters, ext) {
  const parts = ["transactions"];
  if (filters.from) parts.push(`from-${filters.from}`);
  if (filters.to)   parts.push(`to-${filters.to}`);
  if (filters.type && filters.type !== "all") parts.push(filters.type);
  parts.push(new Date().toISOString().slice(0, 10));
  return parts.join("_") + ext;
}

export default function ExportButton({ filters, disabled }) {
  const [exportType, setExportType] = useState(null); // 'xlsx' or 'pdf' or null

  const handleExport = useCallback(async (type) => {
    setExportType(type);

    try {
      // Fetch all filtered transactions (not limited to current page page limit up to 1000)
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

      if (type === "xlsx") {
        // ── Excel Export ───────────────────────────────────────
        const rows = transactions.map((t, i) => ({
          "S.No":        i + 1,
          "Date":        t.date,
          "Description": t.description,
          "Debit (₹)":   t.debit  > 0 ? t.debit  : "",
          "Credit (₹)":  t.credit > 0 ? t.credit : "",
          "Balance (₹)": t.balance,
          "Type":        t.type === "credit" ? "Credit" : "Debit",
          "Category":    t.category || "Other",
          "Status":      t.status === "matched" ? "Matched" : "Unmatched",
          "Matched Ledger Details": t.matchedLedger
            ? `${t.matchedLedger.description} (${t.matchedLedger.category}) Ref: ${t.matchedLedger.referenceNo || "N/A"}`
            : "",
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);

        ws["!cols"] = [
          { wch: 6  },   // S.No
          { wch: 12 },   // Date
          { wch: 45 },   // Description
          { wch: 14 },   // Debit
          { wch: 14 },   // Credit
          { wch: 14 },   // Balance
          { wch: 10 },   // Type
          { wch: 14 },   // Category
          { wch: 12 },   // Status
          { wch: 45 },   // Matched Ledger Details
        ];

        ws["!freeze"] = { xSplit: 0, ySplit: 1 };
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");

        // Summary sheet
        const totalDebit  = transactions.reduce((s, t) => s + (t.debit || 0),  0);
        const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
        const summaryRows = [
          { "Metric": "Total Transactions", "Value": transactions.length },
          { "Metric": "Total Debit (₹)",    "Value": totalDebit  },
          { "Metric": "Total Credit (₹)",   "Value": totalCredit },
          { "Metric": "Net Balance (₹)",     "Value": totalCredit - totalDebit },
          { "Metric": "Export Date",         "Value": new Date().toLocaleDateString("en-IN") },
        ];

        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        wsSummary["!cols"] = [{ wch: 22 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        XLSX.writeFile(wb, buildFilename(filters, ".xlsx"));

      } else if (type === "pdf") {
        // ── PDF Export ─────────────────────────────────────────
        const doc = new jsPDF("p", "pt", "a4");

        // Add header title & metadata
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text("Bank statement digitizer report", 40, 50);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Export date: ${new Date().toLocaleDateString("en-IN")}`, 40, 70);
        doc.text(`Total transactions: ${transactions.length}`, 40, 85);

        const totalDebit  = transactions.reduce((s, t) => s + (t.debit || 0),  0);
        const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
        doc.text(`Total credit: Rs. ${formatINR(totalCredit)}  |  Total debit: Rs. ${formatINR(totalDebit)}`, 40, 100);

        // Draw horizontal line
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(40, 115, 555, 115);

        // Prep table data
        const headers = [["Date", "Description", "Debit (Rs.)", "Credit (Rs.)", "Balance (Rs.)", "Recon Status"]];
        const rows = transactions.map((t) => [
          t.date,
          t.description,
          t.debit > 0 ? formatINR(t.debit) : "—",
          t.credit > 0 ? formatINR(t.credit) : "—",
          formatINR(t.balance),
          t.status === "matched" ? "Matched" : "Unmatched",
        ]);

        doc.autoTable({
          head: headers,
          body: rows,
          startY: 130,
          theme: "striped",
          headStyles: {
            fillColor: [15, 23, 42], // slate-900
            textColor: [255, 255, 255],
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 70 },  // Date
            1: { cellWidth: 160 }, // Description
            2: { cellWidth: 70, halign: "right" },  // Debit
            3: { cellWidth: 70, halign: "right" },  // Credit
            4: { cellWidth: 75, halign: "right" },  // Balance
            5: { cellWidth: 70, halign: "center" }, // Status
          },
          margin: { left: 40, right: 40 },
        });

        doc.save(buildFilename(filters, ".pdf"));
      }

    } catch (err) {
      console.error("[ExportButton] Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExportType(null);
    }
  }, [filters]);

  const loading = exportType !== null;

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Excel Download */}
      <button
        onClick={() => handleExport("xlsx")}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                   transition-all duration-200 disabled:opacity-40
                   disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: exportType === "xlsx" ? `${GREEN}20` : `${GREEN}12`,
          border: `1px solid ${GREEN}${exportType === "xlsx" ? "55" : "30"}`,
          color: GREEN,
        }}
        onMouseEnter={(e) => {
          if (!(disabled || loading)) {
            e.currentTarget.style.backgroundColor = `${GREEN}20`;
            e.currentTarget.style.borderColor = `${GREEN}55`;
          }
        }}
        onMouseLeave={(e) => {
          if (!(disabled || loading)) {
            e.currentTarget.style.backgroundColor = `${GREEN}12`;
            e.currentTarget.style.borderColor = `${GREEN}30`;
          }
        }}
        title="Download transactions as Excel Sheet"
      >
        {loading && exportType === "xlsx" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={13} />
        )}
        {loading && exportType === "xlsx" ? "Exporting..." : "Excel"}
      </button>

      {/* PDF Download */}
      <button
        onClick={() => handleExport("pdf")}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                   transition-all duration-200 disabled:opacity-40
                   disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: exportType === "pdf" ? `${GOLD}1A` : `${GOLD}12`,
          border: `1px solid ${GOLD}${exportType === "pdf" ? "55" : "30"}`,
          color: GOLD_SOFT,
        }}
        onMouseEnter={(e) => {
          if (!(disabled || loading)) {
            e.currentTarget.style.backgroundColor = `${GOLD}1A`;
            e.currentTarget.style.borderColor = `${GOLD}55`;
          }
        }}
        onMouseLeave={(e) => {
          if (!(disabled || loading)) {
            e.currentTarget.style.backgroundColor = `${GOLD}12`;
            e.currentTarget.style.borderColor = `${GOLD}30`;
          }
        }}
        title="Download transactions as PDF Report"
      >
        {loading && exportType === "pdf" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileText size={13} />
        )}
        {loading && exportType === "pdf" ? "Exporting..." : "PDF Report"}
      </button>
    </div>
  );
}