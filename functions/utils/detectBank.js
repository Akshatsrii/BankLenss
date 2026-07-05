/**
 * detectBank.js
 *
 * Matches keywords in PDF text (usually from page 1 header)
 * to identify which bank the statement belongs to.
 *
 * Returns: 'SBI' | 'HDFC' | 'ICICI' | 'AXIS' | 'UNKNOWN'
 */

/**
 * Bank detection rules
 * Each entry has a name and an array of keyword sets.
 * A bank is matched if ANY keyword set has ALL its keywords present.
 */
const BANK_RULES = [
  {
    name: "SBI",
    rules: [
      ["State Bank of India"],
      ["SBI", "Account Statement"],
      ["SBI", "Savings Account"],
      ["SBIN"],
    ],
  },
  {
    name: "HDFC",
    rules: [
      ["HDFC BANK"],
      ["HDFC Bank"],
      ["HDFC", "Account Statement"],
      ["HDFC", "Savings Account"],
    ],
  },
  {
    name: "ICICI",
    rules: [
      ["ICICI BANK"],
      ["ICICI Bank"],
      ["ICICI", "Account Statement"],
      ["ICICI", "Savings Account"],
    ],
  },
  {
    name: "AXIS",
    rules: [
      ["Axis Bank"],
      ["AXIS BANK"],
      ["AXIS", "Account Statement"],
      ["Axis", "Savings Account"],
    ],
  },
];

/**
 * Detects the bank from PDF text content
 *
 * @param {string} text - full text extracted from PDF (all pages)
 * @return {'SBI'|'HDFC'|'ICICI'|'AXIS'|'UNKNOWN'}
 */
function detectBank(text) {
  if (!text || text.trim() === "") return "UNKNOWN";

  const upperText = text.toUpperCase();

  for (const bank of BANK_RULES) {
    for (const keywordSet of bank.rules) {
      // All keywords in this set must be present
      const allMatch = keywordSet.every((keyword) => upperText.includes(keyword.toUpperCase()));

      if (allMatch) {
        console.log(`[detectBank] Matched: ${bank.name} via keywords [${keywordSet.join(", ")}]`);
        return bank.name;
      }
    }
  }

  console.warn("[detectBank] No bank matched. Returning UNKNOWN.");
  return "UNKNOWN";
}

module.exports = { detectBank };
