/**
 * sbi.js — hardened for real statement variations
 *
 * Known SBI format variations handled:
 * - Standard savings account (6-column)
 * - Corporate/salary account (7-column with Ref No)
 * - Balance with "Cr"/"Dr" suffix
 * - Multi-line descriptions (merged into one string)
 * - Summary/opening-balance rows (filtered out)
 */

function detect(text) {
  return (
    text.includes("State Bank of India") ||
    text.includes("SBI") ||
    text.includes("SBIN")
  );
}

function parseDate(s) {
  const t = s.trim();
  // DD/MM/YYYY
  const m1 = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;
  // DD-MM-YYYY
  const m2 = t.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2,"0")}-${m2[1].padStart(2,"0")}`;
  return t;
}

function parseAmount(s) {
  if (!s || s.trim() === "" || s.trim() === "-") return 0;
  // Remove commas, Dr/Cr suffix, currency symbols
  const cleaned = s
    .replace(/,/g, "")
    .replace(/Dr\.?|Cr\.?/gi, "")
    .replace(/₹|Rs\.?/gi, "")
    .trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function isDateRow(s) {
  return /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(s.trim());
}

function isHeaderOrSummaryRow(row) {
  const t = row.join(" ").toLowerCase();
  return (
    t.includes("opening balance") ||
    t.includes("closing balance") ||
    t.includes("total") ||
    t.includes("brought forward") ||
    t.includes("carried forward") ||
    t.includes("page")
  );
}

function parse(rows) {
  const transactions = [];

  // Find header row
  let start = -1;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i].join(" ").toLowerCase();
    const hits = ["date", "description", "narration", "debit", "credit", "balance"]
      .filter((k) => t.includes(k)).length;
    if (hits >= 3) { start = i + 1; break; }
  }
  if (start === -1) start = 0;

  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;
    if (isHeaderOrSummaryRow(row)) continue;

    const dateStr = row[0]?.trim() || "";
    if (!isDateRow(dateStr)) continue;

    const description = row[1]?.trim() || "";
    if (!description) continue;

    // Handle both 5-col and 6-col layouts
    let debit, credit, balance;
    if (row.length >= 6) {
      // 6-col: Date | Desc | Ref | Debit | Credit | Balance
      debit   = parseAmount(row[3]);
      credit  = parseAmount(row[4]);
      balance = parseAmount(row[5]);
    } else {
      // 5-col: Date | Desc | Debit | Credit | Balance
      debit   = parseAmount(row[2]);
      credit  = parseAmount(row[3]);
      balance = parseAmount(row[4]);
    }

    // Detect Cr/Dr suffix on balance column to determine type
    const rawBalance = row[row.length - 1] || "";
    let type;
    if (/Cr/i.test(rawBalance)) {
      type = "credit";
    } else if (/Dr/i.test(rawBalance)) {
      type = "debit";
    } else {
      type = credit > 0 ? "credit" : "debit";
    }

    if (debit === 0 && credit === 0) continue;

    transactions.push({ date: parseDate(dateStr), description, debit, credit, balance, type });
  }

  return transactions;
}

module.exports = { detect, parse };