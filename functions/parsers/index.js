
const { unlockPdf, PDF_ERRORS } = require("../utils/unlockPdf");
const { extractFullText, extractAllRows } = require("../utils/extractRows");
const { detectBank } = require("../utils/detectBank");

const sbi = require("./sbi");
const hdfc = require("./hdfc");
const icici = require("./icici");

// Bank → parser map
const PARSER_MAP = {
  SBI: sbi,
  HDFC: hdfc,
  ICICI: icici,
};

// All error codes in one place
const ERRORS = {
  ...PDF_ERRORS,
  UNSUPPORTED_BANK: "UNSUPPORTED_BANK",
};

/**
 * Main entry point
 *
 * @param {Buffer|Uint8Array} buffer - raw PDF bytes
 * @param {string} password - PDF user password
 * @returns {Promise<{ bank: string, transactions: object[] }>}
 *
 * @throws {Error} with .code from ERRORS
 */
async function parseStatement(buffer, password) {

  // Step 1: Unlock PDF
  // unlockPdf throws WRONG_PASSWORD or CORRUPT_PDF on failure
  const pdf = await unlockPdf(buffer, password);

  // Step 2: Extract full text for detection
  const fullText = await extractFullText(pdf);

  // Step 3: Detect bank
  const bankName = detectBank(fullText);

  if (bankName === "UNKNOWN") {
    const error = new Error(
      "Bank format not supported. Supported: SBI, HDFC, ICICI."
    );
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  // Step 4: Get the right parser
  const parser = PARSER_MAP[bankName];

  if (!parser) {
    // AXIS detected but parser not yet built
    const error = new Error(
      `Parser for ${bankName} is not yet implemented.`
    );
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  // Step 5: Extract rows and parse
  const allRows = await extractAllRows(pdf);
  const transactions = parser.parse(allRows);

  console.log(
    `[parseStatement] Done — ${bankName} | ${transactions.length} transactions`
  );

  // Step 6: Return
  return {
    bank: bankName,
    transactions,
  };
}

module.exports = {
  parseStatement,
  ERRORS,
};