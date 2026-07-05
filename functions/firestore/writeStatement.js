/**
 * writeStatement.js
 *
 * Creates a statement document in Firestore after
 * a PDF has been parsed successfully.
 *
 * Collection: statements
 * Document ID: auto-generated
 *
 * Returns the new statement document ID.
 */

const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Writes a statement document and returns its ID
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.bankName       - SBI | HDFC | ICICI | AXIS
 * @param {string} params.fileName       - original uploaded filename
 * @param {string} params.storagePath    - Firebase Storage path
 * @param {number} params.transactionCount
 * @return {Promise<string>} statementId
 */
async function writeStatement({ userId, bankName, fileName, storagePath, transactionCount }) {
  const db = getFirestore();

  const statementRef = db.collection("statements").doc();

  const statementData = {
    statementId: statementRef.id,
    userId,
    bankName,
    fileName,
    storagePath,
    transactionCount,
    uploadedAt: FieldValue.serverTimestamp(),
    status: "done",
  };

  await statementRef.set(statementData);

  console.log(
    `[writeStatement] Created statement ${statementRef.id} ` +
      `for user ${userId} | bank: ${bankName} | ` +
      `transactions: ${transactionCount}`
  );

  return statementRef.id;
}

module.exports = { writeStatement };
