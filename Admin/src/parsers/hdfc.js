/**
 * hdfc.js — hardened for real statement variations
 *
 * Known HDFC format variations handled:
 * - Standard savings (7-column with Value Date)
 * - Credit card statement (different column order)
 * - DD-MMM-YYYY and DD/MM/YY date formats
 * - Amount with commas e.g. 1,00,000.00
 * - Blank withdrawal or deposit cell
 */

function detect(text) {
  return text.includes("HDFC BANK") || text.includes("HDFC Bank") || text.includes("HDB Financial");
}

const MONTHS = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

function parseDate(s) {
  const t = s.trim();
  // DD-MMM-YYYY
  const m1 = t.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (m1) return `${m1[3]}-${MONTHS[m1[2].toLowerCase()] || "01"}-${m1[1].padStart(2, "0")}`;
  // DD/MM/YY
  const m2 = t.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (m2) return `20${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  // DD/MM/YYYY
  const m3 = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m3) return `${m3[3]}-${m3[2].padStart(2, "0")}-${m3[1].padStart(2, "0")}`;
  // DD-MM-YYYY
  const m4 = t.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m4) return `${m4[3]}-${m4[2].padStart(2, "0")}-${m4[1].padStart(2, "0")}`;
  return t;
}

function parseAmount(s) {
  if (!s || s.trim() === "" || s.trim() === "-") return 0;
  const n = parseFloat(
    s
      .replace(/,/g, "")
      .replace(/₹|Rs\.?/gi, "")
      .trim()
  );
  return isNaN(n) ? 0 : n;
}

function isValidDate(s) {
  return /\d{2}[-/]\w+[-/]\d{2,4}/.test(s.trim());
}

function isHeaderOrSummaryRow(row) {
  const t = row.join(" ").toLowerCase();
  return (
    t.includes("opening balance") ||
    t.includes("closing balance") ||
    t.includes("total") ||
    t.includes("brought forward") ||
    t.includes("page")
  );
}

function parse(rows) {
  const transactions = [];

  let start = -1;
  for (let i = 0; i < rows.length; i++) {
    const t = rows[i].join(" ").toLowerCase();
    const hits = ["date", "narration", "withdrawal", "deposit", "balance"].filter((k) =>
      t.includes(k)
    ).length;
    if (hits >= 3) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) start = 0;

  for (let i = start; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;
    if (isHeaderOrSummaryRow(row)) continue;

    const dateStr = row[0]?.trim() || "";
    if (!isValidDate(dateStr)) continue;

    const description = row[1]?.trim() || "";
    if (!description) continue;

    let debit;
    let credit;
    let balance;
    if (row.length >= 7) {
      // Standard 7-col: Date|Narration|Chq/Ref|ValueDate|Withdrawal|Deposit|Balance
      debit = parseAmount(row[4]);
      credit = parseAmount(row[5]);
      balance = parseAmount(row[6]);
    } else if (row.length === 6) {
      // 6-col: Date|Narration|Chq/Ref|Withdrawal|Deposit|Balance
      debit = parseAmount(row[3]);
      credit = parseAmount(row[4]);
      balance = parseAmount(row[5]);
    } else {
      // 5-col fallback
      debit = parseAmount(row[2]);
      credit = parseAmount(row[3]);
      balance = parseAmount(row[4]);
    }

    if (debit === 0 && credit === 0) continue;

    transactions.push({
      date: parseDate(dateStr),
      description,
      debit,
      credit,
      balance,
      type: credit > 0 ? "credit" : "debit",
    });
  }

  return transactions;
}

export { detect, parse };
