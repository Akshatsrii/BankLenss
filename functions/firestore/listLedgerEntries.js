/**
 * listLedgerEntries.js
 *
 * Queries Firestore ledger_entries collection with pagination.
 */

const {getFirestore} = require('firebase-admin/firestore');

const DEFAULT_PAGE_SIZE = 20;

/**
 * @param {object} params
 * @returns {Promise<object>} paginated entries
 */
async function listLedgerEntries({userId, page = 1, pageSize = DEFAULT_PAGE_SIZE}) {
  const db = getFirestore();

  const size = Math.max(1, parseInt(pageSize) || DEFAULT_PAGE_SIZE);
  const currentPage = Math.max(1, parseInt(page) || 1);

  const snapshot = await db
      .collection('ledger_entries')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();

  const results = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const total = results.length;
  const totalPages = Math.ceil(total / size);
  const offset = (currentPage - 1) * size;
  const paginated = results.slice(offset, offset + size);

  return {
    data: paginated,
    total,
    page: currentPage,
    pageSize: size,
    totalPages,
  };
}

module.exports = {listLedgerEntries};
