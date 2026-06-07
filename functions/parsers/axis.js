/**
 * Axis Bank Statement Parser
 *
 * Column layout (standard Axis account statement):
 * Tran Date | Chq No | Particulars | Debit | Credit | Balance
 *
 * Date format: DD-MM-YYYY or DD/MM/YYYY
 */

/**
 * @param {string} text
 * @returns {boolean}
 */
function detect(text) {
  return (
    text.includes("Axis Bank") ||
    text.includes("AXIS BANK") ||
    text.includes("Axis Bank Limited")
  );
}

/**
 * DD-MM-YYYY or DD/MM/YYYY → YYYY-MM-DD
 * @param {string} dateStr
 * @returns {string}
 */
function parseDate(dateStr) {
  const trimmed = dateStr.trim();

  const match = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return trimmed;
}

/**
 * @param {string} str
 * @returns {number}
 */
function parseAmount(str) {
  if (!str || str.trim() === "" || str.trim() === "-") return 0;
  const cleaned = str.replace(/,/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * @param {string[][]} rows
 * @returns {object[]}
 */
function parse(rows) {
  const transactions = [];

  const headerKeywords = ["tran", "date", "particulars", "debit", "credit", "balance"];

  let dataStartIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].join(" ").toLowerCase();
    const matchCount = headerKeywords.filter((k) => rowText.includes(k)).length;
    if (matchCount >= 3) {
      dataStartIndex = i + 1;
      break;
    }
  }

  if (dataStartIndex === -1) {
    console.warn("[AXIS] Could not find header row, attempting full parse");
    dataStartIndex = 0;
  }

  for (let i = dataStartIndex; i < rows.length; i++) {
    const row = rows[i];

    if (row.length < 4) continue;

    // Axis: Tran Date | Chq No | Particulars | Debit | Credit | Balance
    const dateStr = row[0] ? row[0].trim() : "";
    const description = row[2] ? row[2].trim() : "";
    const debitStr = row[3] ? row[3].trim() : "";
    const creditStr = row[4] ? row[4].trim() : "";
    const balanceStr = row[5] ? row[5].trim() : "";

    if (!/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateStr)) continue;

    const debit = parseAmount(debitStr);
    const credit = parseAmount(creditStr);
    const balance = parseAmount(balanceStr);

    if (debit === 0 && credit === 0) continue;

    const type = credit > 0 ? "credit" : "debit";

    transactions.push({
      date: parseDate(dateStr),
      description,
      debit,
      credit,
      balance,
      type,
    });
  }

  return transactions;
}

module.exports = { detect, parse };