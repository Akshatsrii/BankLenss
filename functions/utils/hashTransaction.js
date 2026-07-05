/**
 * hashTransaction.js
 *
 * Generates a deterministic document ID for each transaction.
 * Same transaction uploaded twice = same ID = no duplicate in Firestore.
 *
 * Hash input: userId + date + description + debit + credit
 */

const crypto = require("crypto");

/**
 * @param {string} userId
 * @param {object} transaction - { date, description, debit, credit }
 * @return {string} 16-char hex ID
 */
function hashTransaction(userId, transaction) {
  const raw = [
    userId,
    transaction.date,
    transaction.description.trim().toLowerCase(),
    transaction.debit.toFixed(2),
    transaction.credit.toFixed(2),
  ].join("|");

  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

module.exports = { hashTransaction };
