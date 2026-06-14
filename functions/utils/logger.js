/**
 * logger.js
 *
 * Structured server-side logging for Cloud Functions.
 * All logs include a consistent shape so they're queryable
 * in Google Cloud Logging.
 *
 * Log shape:
 * {
 *   severity : INFO | WARN | ERROR
 *   service  : "processStatement" | "listTransactions" | ...
 *   uploadId : string
 *   userId   : string (partial — last 6 chars only for privacy)
 *   bank     : string
 *   txCount  : number
 *   errorType: string
 *   message  : string
 *   durationMs: number
 * }
 */

/**
 * Masks userId to last 6 chars for log privacy
 * @param {string} uid
 * @return {string}
 */
function maskUid(uid) {
  if (!uid) return "unknown";
  return `***${uid.slice(-6)}`;
}

/**
 * Base log function
 */
function log(severity, service, data) {
  const entry = {
    severity,
    service,
    timestamp: new Date().toISOString(),
    ...data,
    // Mask userId if present
    userId: data.userId ? maskUid(data.userId) : undefined,
  };

  // Remove undefined keys
  Object.keys(entry).forEach((k) => {
    if (entry[k] === undefined) delete entry[k];
  });

  // Use console.error for ERROR, console.warn for WARN, console.log for INFO
  if (severity === "ERROR") {
    console.error(JSON.stringify(entry));
  } else if (severity === "WARN") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Log a successful processStatement run
 */
function logProcessSuccess({
  uploadId,
  userId,
  bank,
  txCount,
  fileName,
  durationMs,
  scannedPages,
}) {
  log("INFO", "processStatement", {
    message: "Statement processed successfully",
    uploadId,
    userId,
    bank,
    txCount,
    fileName,
    durationMs,
    scannedPages: scannedPages?.length > 0 ? scannedPages : undefined,
  });
}

/**
 * Log a failed processStatement run
 */
function logProcessError({
  uploadId,
  userId,
  errorType,
  errorMessage,
  fileName,
  durationMs,
}) {
  log("ERROR", "processStatement", {
    message: "Statement processing failed",
    uploadId,
    userId,
    errorType,
    errorMessage,
    fileName,
    durationMs,
  });
}

/**
 * Log a listTransactions call
 */
function logListTransactions({
  userId,
  filters,
  resultCount,
  durationMs,
}) {
  log("INFO", "listTransactions", {
    message: "Transactions listed",
    userId,
    filters,
    resultCount,
    durationMs,
  });
}

/**
 * Log a scanned PDF warning
 */
function logScannedWarning({uploadId, userId, scannedPages}) {
  log("WARN", "processStatement", {
    message: "Scanned PDF detected — OCR not supported in v1",
    uploadId,
    userId,
    scannedPages,
  });
}

module.exports = {
  logProcessSuccess,
  logProcessError,
  logListTransactions,
  logScannedWarning,
};
