/**
 * parsers/index.js — updated
 *
 * Changes:
 * - Scanned PDF detection with user-facing warning
 * - Auto-categorization via categorizeAll()
 * - Structured logging via logger
 */

const { unlockPdf, PDF_ERRORS }          = require("../utils/unlockPdf");
const { extractFullText, extractAllRows } = require("../utils/extractRows");
const { detectBank }                      = require("../utils/detectBank");
const { detectScanned }                   = require("../utils/detectScanned");
const { normalizeTransactions }           = require("../utils/normalizeTransactions");
const { categorizeAll }                   = require("../utils/categorize");

const sbi   = require("./sbi");
const hdfc  = require("./hdfc");
const icici = require("./icici");
const axis  = require("./axis");

const PARSER_MAP = { SBI: sbi, HDFC: hdfc, ICICI: icici, AXIS: axis };

const ERRORS = {
  ...PDF_ERRORS,
  UNSUPPORTED_BANK: "UNSUPPORTED_BANK",
  SCANNED_PDF:      "SCANNED_PDF",
};

/**
 * @param {Buffer|Uint8Array} buffer
 * @param {string} password
 * @returns {Promise<{ bank, transactions, warnings }>}
 */
async function parseStatement(buffer, password) {
  const warnings = [];

  // Step 1: Unlock
  const pdf = await unlockPdf(buffer, password);

  // Step 2: Scanned PDF check
  const { isScanned, scannedPages } = await detectScanned(pdf);

  if (isScanned) {
    const warning = `This looks like a scanned PDF (pages: ${scannedPages.join(", ")}). ` +
                    `OCR is not supported in v1 — some transactions may be missing.`;
    warnings.push({ type: "SCANNED_PDF", message: warning, scannedPages });
    console.warn("[parseStatement]", warning);

    // If ALL pages are scanned, throw — nothing can be extracted
    if (scannedPages.length === pdf.numPages) {
      const error = new Error(
        "This PDF appears to be fully scanned (image-only). " +
        "OCR is not supported in v1. Please upload a text-based PDF statement."
      );
      error.code = ERRORS.SCANNED_PDF;
      throw error;
    }
  }

  // Step 3: Extract text for bank detection
  const fullText = await extractFullText(pdf);

  // Step 4: Detect bank
  const bankName = detectBank(fullText);

  if (bankName === "UNKNOWN") {
    const error = new Error(
      "Bank format not supported. Supported: SBI, HDFC, ICICI, AXIS."
    );
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  const parser = PARSER_MAP[bankName];
  if (!parser) {
    const error = new Error(`Parser for ${bankName} is not yet implemented.`);
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  // Step 5: Extract rows and parse
  const allRows        = await extractAllRows(pdf);
  const rawTransactions = parser.parse(allRows);

  // Step 6: Normalize + categorize
  const normalized    = normalizeTransactions(rawTransactions);
  const transactions  = categorizeAll(normalized);

  console.log(
    `[parseStatement] Done — ${bankName} | ` +
    `${transactions.length} transactions | ` +
    `warnings: ${warnings.length}`
  );

  return { bank: bankName, transactions, warnings };
}

module.exports = { parseStatement, ERRORS };