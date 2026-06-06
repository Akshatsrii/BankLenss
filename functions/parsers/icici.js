/**
 * ICICI Statement Parser
 *
 * Column layout (standard ICICI account statement):
 * S No | Transaction Date | Value Date | Description | Ref No | Withdrawal | Deposit | Balance
 *
 * Date format: DD-MMM-YYYY (e.g. 15-Jan-2024)
 * or DD/MM/YYYY
 */

/**
 * Detects if the extracted text belongs to an ICICI statement
 * @param {string} text
 * @returns {boolean}
 */
function detect(text) {
  return (
    text.includes("ICICI BANK") ||
    text.includes("ICICI Bank") ||
    text.includes("ICICI")
  );
}

/**
 * Parses DD-MMM-YYYY or DD/MM/YYYY into YYYY-MM-DD
 * @param {string} dateStr
 * @returns {string}
 */
function parseDate(dateStr) {
  const trimmed = dateStr.trim();

  // DD-MMM-YYYY e.g. 15-Jan-2024
  const longMatch = trimmed.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (longMatch) {
    const months = {
      jan: "01", feb: "02", mar: "03", apr: "04",
      may: "05", jun: "06", jul: "07", aug: "08",
      sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const [, dd, mon, yyyy] = longMatch;
    const mm = months[mon.toLowerCase()] || "01";
    return `${yyyy}-${mm}-${dd.padStart(2, "0")}`;
  }

  // DD/MM/YYYY
  const fullMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (fullMatch) {
    const [, dd, mm, yyyy] = fullMatch;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return trimmed;
}

/**
 * Cleans amount string → number
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
 * Main ICICI parser
 * @param {string[][]} rows
 * @returns {object[]} transactions
 */
function parse(rows) {
  const transactions = [];

  const headerKeywords = ["date", "description", "withdrawal", "deposit", "balance"];

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
    console.warn("[ICICI] Could not find header row, attempting full parse");
    dataStartIndex = 0;
  }

  for (let i = dataStartIndex; i < rows.length; i++) {
    const row = rows[i];

    if (row.length < 6) continue;

    // ICICI: S.No | Transaction Date | Value Date | Description | Ref No | Withdrawal | Deposit | Balance
    // Some exports skip S.No, so check both layouts

    let dateStr, description, withdrawalStr, depositStr, balanceStr;

    // Detect if first column is a serial number (pure integer)
    const firstCol = row[0] ? row[0].trim() : "";
    const hasSerialNo = /^\d+$/.test(firstCol);

    if (hasSerialNo) {
      dateStr = row[1] ? row[1].trim() : "";
      description = row[3] ? row[3].trim() : "";
      withdrawalStr = row[5] ? row[5].trim() : "";
      depositStr = row[6] ? row[6].trim() : "";
      balanceStr = row[7] ? row[7].trim() : "";
    } else {
      dateStr = row[0] ? row[0].trim() : "";
      description = row[2] ? row[2].trim() : "";
      withdrawalStr = row[4] ? row[4].trim() : "";
      depositStr = row[5] ? row[5].trim() : "";
      balanceStr = row[6] ? row[6].trim() : "";
    }

    // Validate date
    if (!/\d{2}[-/]\w+[-/]\d{2,4}/.test(dateStr)) continue;

    const debit = parseAmount(withdrawalStr);
    const credit = parseAmount(depositStr);
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