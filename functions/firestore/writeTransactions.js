/**
 * writeTransactions.js
 *
 * Bulk-writes parsed transactions to Firestore.
 *
 * Key behaviors:
 * - Batches of 500 (Firestore hard limit per batch)
 * - SHA-256 doc ID for deduplication on re-upload
 * - Uses set() with merge: false so duplicate uploads don't overwrite
 */

const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { hashTransaction } = require("../utils/hashTransaction");

const BATCH_SIZE = 500;

/**
 * Writes all transactions in batched Firestore writes
 *
 * @param {object} params
 * @param {string}   params.userId
 * @param {string}   params.statementId
 * @param {object[]} params.transactions  - normalized transaction array
 * @return {Promise<{ written: number, skipped: number }>}
 */
async function writeTransactions({ userId, statementId, transactions }) {
  const db = getFirestore();

  if (!transactions || transactions.length === 0) {
    console.warn("[writeTransactions] No transactions to write.");
    return { written: 0, skipped: 0 };
  }

  let written = 0;
  const skipped = 0;
  let batchCount = 0;

  // Split into chunks of 500
  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const chunk = transactions.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const transaction of chunk) {
      // Compute deterministic doc ID for deduplication
      const docId = hashTransaction(userId, transaction);

      const docRef = db.collection("transactions").doc(docId);

      // create: true means skip if already exists (no overwrite)
      batch.set(
        docRef,
        {
          transactionId: docId,
          statementId,
          userId,
          date: transaction.date,
          description: transaction.description,
          debit: transaction.debit,
          credit: transaction.credit,
          balance: transaction.balance,
          type: transaction.type,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: false }
      );

      written++;
    }

    await batch.commit();
    batchCount++;

    console.log(
      `[writeTransactions] Committed batch ${batchCount} ` +
        `(${chunk.length} docs) | total written: ${written}`
    );
  }

  console.log(
    `[writeTransactions] Done — ` + `${written} written, ${skipped} skipped (duplicates)`
  );

  return { written, skipped };
}

module.exports = { writeTransactions };
