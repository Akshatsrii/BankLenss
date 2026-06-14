/**
 * axis.js — hardened for real statement variations
 *
 * Known Axis format variations handled:
 * - Standard savings (6-column)
 * - DD-MM-YYYY and DD/MM/YYYY dates
 * - Amount with Dr/Cr suffix
 * - Summary/header rows filtered
 */

function detect(text) {
  return (
    text.includes("Axis Bank") ||
    text.includes("AXIS BANK") ||
    text.includes("Axis Bank Limited")
  );
}

function parseDate(s) {
  const t = s.trim();
  const m1 = t.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  // DD-MMM-YYYY
  const MONTHS = {jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"};
  const m2 = t.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (m2) return `${m2[3]}-${MONTHS[m2[2].toLowerCase()]||"01"}-${m2[1].padStart(2, "0")}`;
  return t;
}

function parseAmount(s) {
  if (!s || s.trim() === "" || s.trim() === "-") return 0;
  const n = parseFloat(
      s.replace(/,/g, "").replace(/Dr\.?|Cr\.?/gi, "").replace(/₹|Rs\.?/gi, "").trim(),
  );
  return isNaN(n) ? 0 : n;
}

function isValidDate(s) {
  return /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s.trim()) ||
         /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(s.trim());
}

function isHeaderOrSummaryRow(row) {
  const t = row.join(" ").toLowerCase();
  return (
    t.includes("opening balance") || t.includes("closing balance") ||
    t.includes("total") || t.includes("page") || t.includes("brought forward")
  );
}

function parse(rows) {
  const transactions = [];

  let start = -1;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i].join(" ").toLowerCase();
    const hits = ["tran", "date", "particulars", "debit", "credit", "balance", "withdrawal", "deposit"]
        .filter((k) => t.includes(k)).length;
    if (hits >= 3) {
      start = i + 1; break;
    }
  }
  if (start === -1) start = 0;

  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;
    if (isHeaderOrSummaryRow(row)) continue;

    const dateStr = row[0]?.trim() || "";
    if (!isValidDate(dateStr)) continue;

    const description = row[2]?.trim() || row[1]?.trim() || "";
    if (!description) continue;

    const debit = parseAmount(row[3]);
    const credit = parseAmount(row[4]);
    const balance = parseAmount(row[5]);

    if (debit === 0 && credit === 0) continue;

    // Axis sometimes puts Dr/Cr on the amount cell
    const rawDebit = row[3] || "";
    const rawCredit = row[4] || "";
    let type;
    if (/Cr/i.test(rawCredit) || credit > 0) type = "credit";
    else if (/Dr/i.test(rawDebit) || debit > 0) type = "debit";
    else type = "debit";

    transactions.push({date: parseDate(dateStr), description, debit, credit, balance, type});
  }

  return transactions;
}

module.exports = {detect, parse};
