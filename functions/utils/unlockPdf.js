const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");


const PDF_ERRORS = {
  WRONG_PASSWORD: "WRONG_PASSWORD",
  CORRUPT_PDF: "CORRUPT_PDF",
  EMPTY_PDF: "EMPTY_PDF",
};

/**
 * Creates a typed error with a code attached
 * @param {string} message
 * @param {string} code 
 * @returns {Error}
 */
function createError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

/**
 *
 * @param {Buffer|Uint8Array} buffer - raw PDF bytes
 * @param {string} password - PDF user password (pass "" for non-protected)
 * @returns {Promise<PDFDocumentProxy>} pdfjs document proxy
 *
 * @throws {Error} code: WRONG_PASSWORD — password is incorrect
 * @throws {Error} code: CORRUPT_PDF   — file is not a valid PDF
 * @throws {Error} code: EMPTY_PDF     — PDF opened but has 0 pages
 */
async function unlockPdf(buffer, password = "") {
  // Convert Node Buffer → Uint8Array (pdfjs requires Uint8Array or ArrayBuffer)
  const data =
    buffer instanceof Buffer ? new Uint8Array(buffer) : buffer;

  let pdf;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      password,
      // Suppress pdfjs internal console warnings
      verbosity: 0,
    });

    pdf = await loadingTask.promise;

  } catch (err) {
    console.error("[unlockPdf] Raw error:", err.name, err.message);

    // pdfjs throws PasswordException for wrong / missing password
    if (
      err.name === "PasswordException" ||
      err.message?.toLowerCase().includes("password") ||
      err.code === 1 || // pdfjs PasswordResponses.NEED_PASSWORD
      err.code === 2    // pdfjs PasswordResponses.INCORRECT_PASSWORD
    ) {
      throw createError(
        "Incorrect password. Please check and try again.",
        PDF_ERRORS.WRONG_PASSWORD
      );
    }

    // pdfjs throws InvalidPDFException for corrupt / non-PDF files
    if (
      err.name === "InvalidPDFException" ||
      err.message?.toLowerCase().includes("invalid pdf") ||
      err.message?.toLowerCase().includes("not a pdf")
    ) {
      throw createError(
        "This file is not a valid PDF or is corrupted.",
        PDF_ERRORS.CORRUPT_PDF
      );
    }

    // Unknown error — wrap it
    throw createError(
      `Failed to open PDF: ${err.message}`,
      PDF_ERRORS.CORRUPT_PDF
    );
  }

  // Sanity check: PDF opened but has no pages
  if (!pdf || pdf.numPages === 0) {
    throw createError(
      "PDF opened successfully but contains no pages.",
      PDF_ERRORS.EMPTY_PDF
    );
  }

  console.log(`[unlockPdf] Opened PDF — ${pdf.numPages} page(s)`);

  return pdf;
}

module.exports = { unlockPdf, PDF_ERRORS };