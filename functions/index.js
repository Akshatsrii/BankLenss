const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {initializeApp} = require('firebase-admin/app');
const {getStorage} = require('firebase-admin/storage');

const {parseStatement, ERRORS} = require('./parsers/index');
const {writeStatement} = require('./firestore/writeStatement');
const {writeTransactions} = require('./firestore/writeTransactions');
const {listTransactions} = require('./firestore/listTransactions');
const {listStatements} = require('./firestore/listStatements');
const {addLedgerEntry} = require('./firestore/addLedgerEntry');
const {listLedgerEntries} = require('./firestore/listLedgerEntries');
const {
  logProcessSuccess,
  logProcessError,
  logListTransactions,
  logScannedWarning,
} = require('./utils/logger');

initializeApp();

// ─── helloWorld ───────────────────────────────────────────────
exports.helloWorld = onCall(async () => ({
  message: 'Hello from Firebase Functions!',
  timestamp: new Date().toISOString(),
}));

// ─── processStatement ─────────────────────────────────────────
exports.processStatement = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const userId = request.auth.uid;
  const {storagePath, password, fileName} = request.data;
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  if (!storagePath) {
    throw new HttpsError('invalid-argument', 'storagePath is required.');
  }

  // Step 1: Download PDF from Storage
  let buffer;
  try {
    const bucket = getStorage().bucket();
    const [bytes] = await bucket.file(storagePath).download();
    buffer = bytes;
    console.log(`[processStatement] uploadId=${uploadId} Downloaded ${buffer.length} bytes`);
  } catch (err) {
    logProcessError({
      uploadId,
      userId,
      errorType: 'STORAGE_DOWNLOAD',
      errorMessage: err.message,
      fileName,
      durationMs: Date.now() - startTime,
    });
    throw new HttpsError('not-found', 'Could not find the uploaded PDF in storage.');
  }

  // Step 2: Parse
  let parseResult;
  try {
    parseResult = await parseStatement(buffer, password || '');
  } catch (err) {
    logProcessError({
      uploadId,
      userId,
      errorType: err.code || 'PARSE_FAILED',
      errorMessage: err.message,
      fileName,
      durationMs: Date.now() - startTime,
    });

    if (err.code === ERRORS.WRONG_PASSWORD) throw new HttpsError('invalid-argument', err.message);
    if (err.code === ERRORS.CORRUPT_PDF) throw new HttpsError('invalid-argument', err.message);
    if (err.code === ERRORS.UNSUPPORTED_BANK) throw new HttpsError('unimplemented', err.message);
    if (err.code === ERRORS.SCANNED_PDF) throw new HttpsError('invalid-argument', err.message);
    throw new HttpsError('internal', err.message);
  }

  const {bank, transactions, warnings} = parseResult;

  // Log scanned warning if partial
  const scannedWarning = warnings.find((w) => w.type === 'SCANNED_PDF');
  if (scannedWarning) {
    logScannedWarning({uploadId, userId, scannedPages: scannedWarning.scannedPages});
  }

  // Step 3: Write statement doc
  const statementId = await writeStatement({
    userId,
    bankName: bank,
    fileName: fileName || storagePath.split('/').pop(),
    storagePath,
    transactionCount: transactions.length,
  });

  // Step 4: Batch-write transactions
  const {written} = await writeTransactions({userId, statementId, transactions});

  logProcessSuccess({
    uploadId,
    userId,
    bank,
    txCount: written,
    fileName,
    durationMs: Date.now() - startTime,
    scannedPages: scannedWarning?.scannedPages,
  });

  return {
    statementId,
    bank,
    transactionCount: written,
    warnings: warnings.map((w) => w.message),
  };
});

// ─── listTransactions ─────────────────────────────────────────
exports.listTransactions = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const userId = request.auth.uid;
  const startTime = Date.now();
  const filters = request.data;

  try {
    const result = await listTransactions({userId, ...filters});

    logListTransactions({
      userId,
      filters: {
        from: filters.from,
        to: filters.to,
        type: filters.type,
        search: filters.search,
        statementId: filters.statementId,
      },
      resultCount: result.total,
      durationMs: Date.now() - startTime,
    });

    return result;
  } catch (err) {
    console.error('[listTransactions] Error:', err);
    throw new HttpsError('internal', err.message);
  }
});

// ─── listStatements ───────────────────────────────────────────
exports.listStatements = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login required.');
  }
  try {
    const statements = await listStatements(request.auth.uid);
    return {data: statements};
  } catch (err) {
    console.error('[listStatements] Error:', err);
    throw new HttpsError('internal', err.message);
  }
});

// ─── addLedgerEntry ───────────────────────────────────────────
exports.addLedgerEntry = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }
  const userId = request.auth.uid;
  try {
    const result = await addLedgerEntry({userId, ...request.data});
    return result;
  } catch (err) {
    console.error('[addLedgerEntry] Error:', err);
    throw new HttpsError('internal', err.message);
  }
});

// ─── listLedgerEntries ─────────────────────────────────────────
exports.listLedgerEntries = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }
  const userId = request.auth.uid;
  try {
    const result = await listLedgerEntries({userId, ...request.data});
    return result;
  } catch (err) {
    console.error('[listLedgerEntries] Error:', err);
    throw new HttpsError('internal', err.message);
  }
});
