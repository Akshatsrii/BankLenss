/**
 * detectScanned.js
 *
 * Checks if a PDF page has extractable text or is a scanned image.
 * pdfjs returns items with empty/whitespace strings for scanned pages.
 *
 * Returns: { isScanned: bool, scannedPages: number[] }
 */

const MIN_CHARS_PER_PAGE = 50; // pages with fewer chars are likely scanned

/**
 * Checks a single page for meaningful text content
 * @param {PDFPageProxy} page
 * @return {Promise<boolean>} true if page appears scanned
 */
async function isPageScanned(page) {
  const content = await page.getTextContent();
  const text = content.items
    .map((item) => item.str)
    .join("")
    .trim();
  return text.length < MIN_CHARS_PER_PAGE;
}

/**
 * Checks all pages of a PDF for scanned content
 *
 * @param {PDFDocumentProxy} pdf
 * @return {Promise<{ isScanned: boolean, scannedPages: number[] }>}
 */
async function detectScanned(pdf) {
  const scannedPages = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const scanned = await isPageScanned(page);
    if (scanned) scannedPages.push(pageNum);
  }

  const isScanned = scannedPages.length > 0;

  if (isScanned) {
    console.warn(
      `[detectScanned] Scanned pages detected: [${scannedPages.join(", ")}]. ` +
        `OCR is not supported in v1.`
    );
  }

  return { isScanned, scannedPages };
}

module.exports = { detectScanned };
