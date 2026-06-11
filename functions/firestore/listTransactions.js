/**
 * listTransactions.js
 *
 * Queries Firestore transactions collection with filters.
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
 *   search      : string   (optional — description substring match)
 *   page        : number   (default 1)
 *   pageSize    : number   (default 20, max 100)
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

const { getFirestore } = require("firebase-admin/firestore");

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

/**
 * @param {object} params
 * @returns {Promise<object>}
 */
async function listTransactions({
  userId,
  statementId,                    // ← added
  from,
  to,
  minAmount,
  maxAmount,
  type,
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const db = getFirestore();

  // Clamp pageSize
  const size = Math.min(
    Math.max(1, parseInt(pageSize) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );
  const currentPage = Math.max(1, parseInt(page) || 1);

  // Base query — always filter by userId
  let query = db
    .collection("transactions")
    .where("userId", "==", userId);

  // Statement filter — narrow to a single uploaded statement
  if (statementId) {
    query = query.where("statementId", "==", statementId); // ← added
  }

  // Date range filter
  // Uses string comparison — works because dates are YYYY-MM-DD
  if (from) {
    query = query.where("date", ">=", from);
  }
  if (to) {
    query = query.where("date", "<=", to);
  }

  // Type filter
  if (type && (type === "debit" || type === "credit")) {
    query = query.where("type", "==", type);
  }

  // Order by date descending
  query = query.orderBy("date", "desc");

  // Fetch all matching docs for this filter combination
  // (Firestore doesn't support server-side pagination with total count
  //  in a single query, so we fetch filtered set and paginate in memory)
  const snapshot = await query.get();

  let results = snapshot.docs.map((doc) => doc.data());

  // --- In-memory filters (Firestore can't do these server-side) ---

  // Amount filter (checks both debit and credit columns)
  if (minAmount !== undefined && minAmount !== null && minAmount !== "") {
    const min = parseFloat(minAmount);
    if (!isNaN(min)) {
      results = results.filter(
        (t) => t.debit >= min || t.credit >= min
      );
    }
  }

  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== "") {
    const max = parseFloat(maxAmount);
    if (!isNaN(max)) {
      results = results.filter(
        (t) =>
          (t.debit > 0 && t.debit <= max) ||
          (t.credit > 0 && t.credit <= max)
      );
    }
  }

  // Search filter — case-insensitive substring on description
  if (search && search.trim() !== "") {
    const term = search.trim().toLowerCase();
    results = results.filter((t) =>
      t.description.toLowerCase().includes(term)
    );
  }

  // Total after all filters
  const total = results.length;
  const totalPages = Math.ceil(total / size);

  // Paginate
  const offset = (currentPage - 1) * size;
  const paginated = results.slice(offset, offset + size);

  console.log(
    `[listTransactions] user: ${userId} | ` +
    `statementId: ${statementId || "all"} | ` +
    `filters: from=${from} to=${to} type=${type} search=${search} | ` +
    `total: ${total} | page: ${currentPage}/${totalPages}`
  );

  return {
    data: paginated,
    total,
    page: currentPage,
    pageSize: size,
    totalPages,
  };
}

module.exports = { listTransactions };