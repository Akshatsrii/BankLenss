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
 *   category    : string   (optional — category filter)
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

const {getFirestore} = require("firebase-admin/firestore");

const MAX_PAGE_SIZE = 100;
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
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const db = getFirestore();

  const size = Math.min(
      Math.max(1, parseInt(pageSize) || DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE,
  );

  const currentPage = Math.max(1, parseInt(page) || 1);

  // Base query
  let query = db
      .collection("transactions")
      .where("userId", "==", userId);

  // Statement filter
  if (statementId) {
    query = query.where("statementId", "==", statementId);
  }

  // Date filters
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

  // Sort newest first
  query = query.orderBy("date", "desc");

  const snapshot = await query.get();

  let results = snapshot.docs.map((doc) => doc.data());

  // Amount filters
  if (minAmount !== undefined && minAmount !== null && minAmount !== "") {
    const min = parseFloat(minAmount);

    if (!isNaN(min)) {
      results = results.filter(
          (t) => t.debit >= min || t.credit >= min,
      );
    }
  }

  if (maxAmount !== undefined && maxAmount !== null && maxAmount !== "") {
    const max = parseFloat(maxAmount);

    if (!isNaN(max)) {
      results = results.filter(
          (t) =>
            (t.debit > 0 && t.debit <= max) ||
          (t.credit > 0 && t.credit <= max),
      );
    }
  }

  // Search filter
  if (search && search.trim() !== "") {
    const term = search.trim().toLowerCase();

    results = results.filter((t) =>
      (t.description || "")
          .toLowerCase()
          .includes(term),
    );
  }

  // Category filter (in-memory — stored on transaction doc)
  if (category && category !== "all") {
    results = results.filter(
        (t) => t.category === category,
    );
  }

  const total = results.length;
  const totalPages = Math.ceil(total / size);

  const offset = (currentPage - 1) * size;
  const paginated = results.slice(offset, offset + size);

  console.log(
      `[listTransactions] user: ${userId} | ` +
    `statementId: ${statementId || "all"} | ` +
    `filters: from=${from} to=${to} type=${type} category=${category || "all"} search=${search} | ` +
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
