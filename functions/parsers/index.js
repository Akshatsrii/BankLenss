/**
 * Parser Dispatcher
 *
 * Entry point: parseStatement(buffer, password)
 *
 * Flow:
 * 1. Unlock PDF using password
 * 2. Extract raw text per page
 * 3. Detect which bank the statement belongs to
 * 4. Dispatch to the correct parser
 * 5. Return { bank, transactions[] }
 */

const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const sbi = require("./sbi");
const hdfc = require("./hdfc");
const icici = require("./icici");

// Supported banks registry
const PARSERS = [
  { name: "SBI", parser: sbi },
  { name: "HDFC", parser: hdfc },
  { name: "ICICI", parser: icici },
];

// Error codes
const ERRORS = {
  WRONG_PASSWORD: "WRONG_PASSWORD",
  UNSUPPORTED_BANK: "UNSUPPORTED_BANK",
  CORRUPT_PDF: "CORRUPT_PDF",
  EMPTY_PDF: "EMPTY_PDF",
};

/**
 * Extracts all text from a PDF page as a flat string
 * @param {PDFPageProxy} page
 * @returns {Promise<string>}
 */
async function extractPageText(page) {
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(" ");
}

/**
 * Extracts text lines grouped as rows (by Y position)
 * This is needed to reconstruct table rows from PDF layout
 * @param {PDFPageProxy} page
 * @returns {Promise<string[][]>}
 */
async function extractPageRows(page) {
  const content = await page.getTextContent();
  const items = content.items;

  // Group items by their Y coordinate (rounded to nearest 2px)
  const rowMap = new Map();

  for (const item of items) {
    const y = Math.round(item.transform[5] / 2) * 2;
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push({ x: item.transform[4], text: item.str });
  }

  // Sort rows top-to-bottom (PDF Y axis is bottom-up, so descending)
  const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);

  const rows = sortedYs.map((y) => {
    // Sort items in row left-to-right
    const cells = rowMap.get(y).sort((a, b) => a.x - b.x);
    return cells.map((c) => c.text);
  });

  return rows;
}

/**
 * Detects which bank the statement belongs to
 * @param {string} fullText - concatenated text from all pages
 * @returns {object|null} matched parser entry or null
 */
function detectBank(fullText) {
  for (const entry of PARSERS) {
    if (entry.parser.detect(fullText)) {
      return entry;
    }
  }
  return null;
}

/**
 * Main entry point
 *
 * @param {Buffer|Uint8Array} buffer - raw PDF bytes
 * @param {string} password - PDF user password
 * @returns {Promise<{ bank: string, transactions: object[] }>}
 *
 * @throws {Error} with code WRONG_PASSWORD | UNSUPPORTED_BANK | CORRUPT_PDF | EMPTY_PDF
 */
async function parseStatement(buffer, password) {
  let pdf;

  // Step 1: Unlock PDF
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: buffer instanceof Buffer ? new Uint8Array(buffer) : buffer,
      password: password || "",
    });

    pdf = await loadingTask.promise;
  } catch (err) {
    // pdfjs throws PasswordException for wrong password
    if (
      err.name === "PasswordException" ||
      err.message?.toLowerCase().includes("password")
    ) {
      const error = new Error("Incorrect password for this PDF.");
      error.code = ERRORS.WRONG_PASSWORD;
      throw error;
    }

    const error = new Error("Could not open PDF. File may be corrupt.");
    error.code = ERRORS.CORRUPT_PDF;
    throw error;
  }

  // Step 2: Extract text from all pages
  if (pdf.numPages === 0) {
    const error = new Error("PDF has no pages.");
    error.code = ERRORS.EMPTY_PDF;
    throw error;
  }

  let fullText = "";
  const allRows = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const pageText = await extractPageText(page);
    const pageRows = await extractPageRows(page);

    fullText += " " + pageText;
    allRows.push(...pageRows);
  }

  // Step 3: Detect bank
  const matched = detectBank(fullText);

  if (!matched) {
    const error = new Error(
      "Bank format not supported. Supported banks: SBI, HDFC, ICICI."
    );
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  console.log(`[Parser] Detected bank: ${matched.name}`);

  // Step 4: Dispatch to correct parser
  const transactions = matched.parser.parse(allRows);

  console.log(
    `[Parser] Extracted ${transactions.length} transactions from ${matched.name} statement`
  );

  // Step 5: Return result
  return {
    bank: matched.name,
    transactions,
  };
}

module.exports = {
  parseStatement,
  detectBank,
  ERRORS,
};