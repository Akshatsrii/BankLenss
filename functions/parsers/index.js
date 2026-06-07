const { unlockPdf, PDF_ERRORS } = require("../utils/unlockPdf");
const { extractFullText, extractAllRows } = require("../utils/extractRows");
const { detectBank } = require("../utils/detectBank");
const { normalizeTransactions } = require("../utils/normalizeTransactions");

const sbi = require("./sbi");
const hdfc = require("./hdfc");
const icici = require("./icici");
const axis = require("./axis");

const PARSER_MAP = {
  SBI: sbi,
  HDFC: hdfc,
  ICICI: icici,
  AXIS: axis,
};

const ERRORS = {
  ...PDF_ERRORS,
  UNSUPPORTED_BANK: "UNSUPPORTED_BANK",
};

async function parseStatement(buffer, password) {
  const pdf = await unlockPdf(buffer, password);

  const fullText = await extractFullText(pdf);

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
    const error = new Error(
      `Parser for ${bankName} is not yet implemented.`
    );
    error.code = ERRORS.UNSUPPORTED_BANK;
    throw error;
  }

  const allRows = await extractAllRows(pdf);
  const rawTransactions = parser.parse(allRows);

  // Normalize and validate before returning
  const transactions = normalizeTransactions(rawTransactions);

  console.log(
    `[parseStatement] Done — ${bankName} | ${transactions.length} transactions`
  );

  return { bank: bankName, transactions };
}

module.exports = { parseStatement, ERRORS };