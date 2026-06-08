const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const { parseStatement, ERRORS } = require("./parsers/index");
const { writeStatement } = require("./firestore/writeStatement");
const { writeTransactions } = require("./firestore/writeTransactions");
const { listTransactions } = require("./firestore/listTransactions");

initializeApp();

// ─── helloWorld ───────────────────────────────────────────────
exports.helloWorld = onCall(async () => {
  return {
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  };
});

// ─── processStatement ─────────────────────────────────────────
/**
 * Callable: processStatement
 *
 * Input:  { storagePath, password, fileName }
 * Output: { statementId, bank, transactionCount }
 *
 * Flow:
 * 1. Read PDF from Firebase Storage
 * 2. Parse it (unlock → detect → extract)
 * 3. Write statement doc
 * 4. Batch-write transactions
 */
exports.processStatement = onCall(async (request) => {
  // Auth check
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to process statements."
    );
  }

  const userId = request.auth.uid;
  const { storagePath, password, fileName } = request.data;

  if (!storagePath) {
    throw new HttpsError(
      "invalid-argument",
      "storagePath is required."
    );
  }

  // Step 1: Read PDF buffer from Firebase Storage
  let buffer;
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);
    const [bytes] = await file.download();
    buffer = bytes;
    console.log(
      `[processStatement] Downloaded ${buffer.length} bytes from ${storagePath}`
    );
  } catch (err) {
    console.error("[processStatement] Storage download failed:", err);
    throw new HttpsError(
      "not-found",
      "Could not find the uploaded PDF in storage."
    );
  }

  // Step 2: Parse PDF
  let parseResult;
  try {
    parseResult = await parseStatement(buffer, password || "");
  } catch (err) {
    console.error("[processStatement] Parse failed:", err.code, err.message);

    if (err.code === ERRORS.WRONG_PASSWORD) {
      throw new HttpsError("invalid-argument", err.message);
    }
    if (err.code === ERRORS.CORRUPT_PDF) {
      throw new HttpsError("invalid-argument", err.message);
    }
    if (err.code === ERRORS.UNSUPPORTED_BANK) {
      throw new HttpsError("unimplemented", err.message);
    }
    throw new HttpsError("internal", err.message);
  }

  const { bank, transactions } = parseResult;

  // Step 3: Write statement doc
  const statementId = await writeStatement({
    userId,
    bankName: bank,
    fileName: fileName || storagePath.split("/").pop(),
    storagePath,
    transactionCount: transactions.length,
  });

  // Step 4: Batch-write transactions
  const { written } = await writeTransactions({
    userId,
    statementId,
    transactions,
  });

  return {
    statementId,
    bank,
    transactionCount: written,
  };
});

// ─── listTransactions ─────────────────────────────────────────
/**
 * Callable: listTransactions
 *
 * Input:  { from, to, minAmount, maxAmount, type, search, page, pageSize }
 * Output: { data, total, page, pageSize, totalPages }
 */
exports.listTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to view transactions."
    );
  }

  const userId = request.auth.uid;
  const {
    from,
    to,
    minAmount,
    maxAmount,
    type,
    search,
    page,
    pageSize,
  } = request.data;

  try {
    const result = await listTransactions({
      userId,
      from,
      to,
      minAmount,
      maxAmount,
      type,
      search,
      page,
      pageSize,
    });

    return result;
  } catch (err) {
    console.error("[listTransactions] Error:", err);
    throw new HttpsError("internal", err.message);
  }
});