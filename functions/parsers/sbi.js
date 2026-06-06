/**
 * SBI Statement Parser
 *
 * Column layout (standard SBI account statement):
 * Date | Description | Ref No | Debit | Credit | Balance
 *
 * Date format: DD/MM/YYYY
 * Debit/Credit markers: sometimes appended as "Dr" / "Cr" on balance
 */

/**
 * Detects if the extracted text belongs to an SBI statement
 * @param {string} text - full PDF text
 * @returns {boolean}
 */
function detect(text) {
  return (
    text.includes("State Bank of India") ||
    text.includes("SBI")
  );
}

/**
 * Parses DD/MM/YYYY into YYYY-MM-DD
 * @param {string} dateStr
 * @returns {string}
 */
function parseDate(dateStr) {
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return dateStr;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

/**
 * Cleans amount string → number
 * Removes commas, spaces, Dr/Cr suffixes
 * @param {string} str
 * @returns {number}
 */
function parseAmount(str) {
  if (!str || str.trim() === "" || str.trim() === "-") return 0;
  const cleaned = str
    .replace(/,/g, "")
    .replace(/Dr|Cr/gi, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Main SBI parser
 * @param {string[][]} rows - array of rows, each row is array of cell strings
 * @returns {object[]} transactions
 */
function parse(rows) {
  const transactions = [];

  // SBI header row contains these keywords
  const headerKeywords = ["date", "description", "narration", "debit", "credit", "balance"];

  let dataStartIndex = -1;

  // Find the header row
  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].join(" ").toLowerCase();
    const matchCount = headerKeywords.filter((k) => rowText.includes(k)).length;
    if (matchCount >= 3) {
      dataStartIndex = i + 1;
      break;
    }
  }

  if (dataStartIndex === -1) {
    console.warn("[SBI] Could not find header row, attempting full parse");
    dataStartIndex = 0;
  }

  for (let i = dataStartIndex; i < rows.length; i++) {
    const row = rows[i];

    // Skip rows that are too short
    if (row.length < 4) continue;

    // SBI standard: Date | Description | Ref/Cheque No | Debit | Credit | Balance
    const dateStr = row[0] ? row[0].trim() : "";
    const description = row[1] ? row[1].trim() : "";
    const debitStr = row[3] ? row[3].trim() : "";
    const creditStr = row[4] ? row[4].trim() : "";
    const balanceStr = row[5] ? row[5].trim() : "";

    // Validate date format DD/MM/YYYY
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) continue;

    // Skip rows where both debit and credit are empty
    if (!debitStr && !creditStr) continue;

    const debit = parseAmount(debitStr);
    const credit = parseAmount(creditStr);
    const balance = parseAmount(balanceStr);

    // Determine type
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