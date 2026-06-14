/**
 * icici.js — hardened for real statement variations
 *
 * Known ICICI format variations handled:
 * - Standard savings (S.No + 7 columns)
 * - Without S.No (6 columns)
 * - DD-MMM-YYYY and DD/MM/YYYY dates
 * - Withdrawal/Deposit column names vary (sometimes Dr/Cr)
 */

function detect(text) {
  return text.includes("ICICI BANK") || text.includes("ICICI Bank");
}

const MONTHS = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseDate(s) {
  const t = s.trim();
  const m1 = t.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (m1) return `${m1[3]}-${MONTHS[m1[2].toLowerCase()]||"01"}-${m1[1].padStart(2, "0")}`;
  const m2 = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  const m3 = t.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (m3) return `20${m3[3]}-${m3[2].padStart(2, "0")}-${m3[1].padStart(2, "0")}`;
  return t;
}

function parseAmount(s) {
  if (!s || s.trim() === "" || s.trim() === "-") return 0;
  const n = parseFloat(s.replace(/,/g, "").replace(/₹|Rs\.?/gi, "").replace(/Dr\.?|Cr\.?/gi, "").trim());
  return isNaN(n) ? 0 : n;
}

function isValidDate(s) {
  return /\d{2}[-/]\w+[-/]\d{2,4}/.test(s.trim());
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
    const hits = ["date", "description", "particulars", "withdrawal", "deposit", "debit", "credit", "balance"]
        .filter((k) => t.includes(k)).length;
    if (hits >= 3) {
      start = i + 1; break;
    }
  }
  if (start === -1) start = 0;

  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    if (isHeaderOrSummaryRow(row)) continue;

    const hasSerial = /^\d+$/.test(row[0]?.trim() || "");
    const offset = hasSerial ? 1 : 0;

    const dateStr = row[offset]?.trim() || "";
    const description = row[offset + 2]?.trim() || row[offset + 1]?.trim() || "";
    const debit = parseAmount(row[offset + 4]);
    const credit = parseAmount(row[offset + 5]);
    const balance = parseAmount(row[offset + 6]) || parseAmount(row[offset + 5]);

    if (!isValidDate(dateStr)) continue;
    if (!description) continue;
    if (debit === 0 && credit === 0) continue;

    // Some ICICI statements have Dr/Cr on the amount cell itself
    const rawDebitCell = row[offset + 4] || "";
    const rawCreditCell = row[offset + 5] || "";
    let type;
    if (/Cr/i.test(rawCreditCell) || credit > 0) type = "credit";
    else if (/Dr/i.test(rawDebitCell) || debit > 0) type = "debit";
    else type = "debit";

    transactions.push({date: parseDate(dateStr), description, debit, credit, balance, type});
  }

  return transactions;
}

module.exports = {detect, parse};
