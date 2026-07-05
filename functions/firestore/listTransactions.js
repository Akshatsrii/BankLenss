/**
 * listTransactions.js
 *
 * Queries Firestore transactions collection with filters.
 * Now auto-matches transactions with manual ledger entries.
 *
 * Accepts:
 * {
 *   userId      : string   (required — from auth context)
 *   statementId : string   (optional — filter by specific statement)
 *   from        : string   (optional — YYYY-MM-DD start date)
 *   to          : string   (optional — YYYY-MM-DD end date)
 *   minAmount   : number   (optional — min of debit or credit)
 *   maxAmount   : number   (optional — max of debit or credit)
 *   type        : string   (optional — "debit" | "credit")
 *   category    : string   (optional — category filter)
 *   search      : string   (optional — description substring match)
 *   status      : string   (optional — "matched" | "unmatched" | "all")
 *   page        : number   (default 1)
 *   pageSize    : number   (default 20, max 1000)
 * }
 *
 * Returns:
 * {
 *   data      : transaction[]
 *   total     : number
 *   page      : number
 *   pageSize  : number
 *   totalPages: number
 * }
 */

const {getFirestore} = require('firebase-admin/firestore');

const MAX_PAGE_SIZE = 1000;
const DEFAULT_PAGE_SIZE = 20;

/**
 * @param {object} params
 * @return {Promise<object>}
 */
async function listTransactions({
  userId,
  statementId,
  from,
  to,
  minAmount,
  maxAmount,
  type,
  category,
  search,
  status = 'all',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const db = getFirestore();

  const size = Math.min(Math.max(1, parseInt(pageSize) || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

  const currentPage = Math.max(1, parseInt(page) || 1);

  // Base query
  let query = db.collection('transactions').where('userId', '==', userId);

  // Statement filter
  if (statementId) {
    query = query.where('statementId', '==', statementId);
  }

  // Date filters
  if (from) {
    query = query.where('date', '>=', from);
  }

  if (to) {
    query = query.where('date', '<=', to);
  }

  // Type filter
  if (type && (type === 'debit' || type === 'credit')) {
    query = query.where('type', '==', type);
  }

  // Sort newest first
  query = query.orderBy('date', 'desc');

  const snapshot = await query.get();

  let results = snapshot.docs.map((doc) => doc.data());

  // Amount filters
  if (minAmount !== undefined && minAmount !== null && minAmount !== '') {
    const min = parseFloat(minAmount);

    if (!isNaN(min)) {
      results = results.filter((t) => t.debit >= min || t.credit >= min);
    }
  }

  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') {
    const max = parseFloat(maxAmount);

    if (!isNaN(max)) {
      results = results.filter(
          (t) => (t.debit > 0 && t.debit <= max) || (t.credit > 0 && t.credit <= max),
      );
    }
  }

  // Search filter
  if (search && search.trim() !== '') {
    const term = search.trim().toLowerCase();

    results = results.filter((t) => (t.description || '').toLowerCase().includes(term));
  }

  // Category filter (in-memory — stored on transaction doc)
  if (category && category !== 'all') {
    results = results.filter((t) => t.category === category);
  }

  // ── Auto-Reconciliation / Matching Logic ───────────────────────
  // Fetch user's manual ledger entries
  const ledgerSnapshot = await db.collection('ledger_entries').where('userId', '==', userId).get();

  const ledgerEntries = ledgerSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const matchedLedgerIds = new Set();

  results = results.map((t) => {
    let match = null;

    if (t.matchedLedgerEntryId) {
      match = ledgerEntries.find((l) => l.id === t.matchedLedgerEntryId);
    }

    if (!match) {
      const amount = t.type === 'credit' ? t.credit : t.debit;
      match = ledgerEntries.find((l) => {
        if (matchedLedgerIds.has(l.id)) return false;
        if (l.type !== t.type) return false;
        if (Math.abs(l.amount - amount) >= 0.01) return false;

        // Check if date is within 3 days
        const tDate = new Date(t.date);
        const lDate = new Date(l.date);
        const diffMs = Math.abs(tDate - lDate);
        return diffMs <= 3 * 24 * 60 * 60 * 1000;
      });
    }

    if (match) {
      matchedLedgerIds.add(match.id);
      return {
        ...t,
        status: 'matched',
        matchedLedger: match,
      };
    } else {
      return {
        ...t,
        status: 'unmatched',
        matchedLedger: null,
      };
    }
  });

  // Filter by status if specified
  if (status && status !== 'all') {
    results = results.filter((t) => t.status === status);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / size);

  const offset = (currentPage - 1) * size;
  const paginated = results.slice(offset, offset + size);

  console.log(
      `[listTransactions] user: ${userId} | ` +
      `statementId: ${statementId || 'all'} | ` +
      `filters: from=${from} to=${to} type=${type} category=${category || 'all'} search=${search} status=${status} | ` +
      `total: ${total} | page: ${currentPage}/${totalPages}`,
  );

  return {
    data: paginated,
    total,
    page: currentPage,
    pageSize: size,
    totalPages,
  };
}

module.exports = {listTransactions};
