/**
 * hashTransaction.js
 *
 * Generates a deterministic document ID for each transaction in the browser.
 * Same transaction uploaded twice = same ID = no duplicate in Firestore.
 */

async function hashTransaction(userId, transaction) {
  const raw = [
    userId,
    transaction.date,
    transaction.description.trim().toLowerCase(),
    transaction.debit.toFixed(2),
    transaction.credit.toFixed(2),
  ].join("|");

  const msgUint8 = new TextEncoder().encode(raw);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.slice(0, 16);
}

export { hashTransaction };
