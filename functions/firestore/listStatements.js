/**
 * listStatements.js
 *
 * Returns all statement docs for a user, ordered by uploadedAt desc.
 * Used to populate the statement selector dropdown.
 */

const { getFirestore } = require("firebase-admin/firestore");

async function listStatements(userId) {
  const db = getFirestore();

  const snapshot = await db
    .collection("statements")
    .where("userId", "==", userId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      statementId: d.statementId,
      bankName: d.bankName,
      fileName: d.fileName,
      transactionCount: d.transactionCount,
      uploadedAt: d.uploadedAt?.toDate?.()?.toISOString() || null,
      status: d.status,
    };
  });
}

module.exports = { listStatements };
