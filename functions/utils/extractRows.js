/**
 * extractRows.js
 *
 * Responsibilities:
 * - Pull raw text items with x/y/width from pdfjs getTextContent()
 * - Print items as JSON for inspection (Task 3)
 * - Group items into rows by Y coordinate with 2px tolerance (Task 4)
 * - Sort each row left-to-right by X coordinate
 */

/**
 * Extracts raw text items from a single page
 * Each item includes: str, x, y, width, height, fontSize
 *
 * Use this to inspect raw PDF layout before grouping
 *
 * @param {PDFPageProxy} page
 * @return {Promise<object[]>} array of raw items
 */
async function extractRawItems(page) {
  const content = await page.getTextContent();

  const items = content.items.map((item) => {
    const [, , , , x, y] = item.transform;
    return {
      str: item.str,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      width: Math.round((item.width || 0) * 100) / 100,
      height: Math.round((item.height || 0) * 100) / 100,
      fontSize: Math.round((item.height || 0) * 10) / 10,
    };
  });

  return items;
}

/**
 * Prints raw text items from all pages as formatted JSON
 * Use this for debugging / inspecting a new bank format
 *
 * @param {PDFDocumentProxy} pdf
 * @param {number} maxPages - how many pages to print (default: all)
 */
async function printRawItemsJson(pdf, maxPages = pdf.numPages) {
  const limit = Math.min(maxPages, pdf.numPages);

  for (let pageNum = 1; pageNum <= limit; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const items = await extractRawItems(page);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`PAGE ${pageNum} — ${items.length} text items`);
    console.log("=".repeat(60));
    console.log(JSON.stringify(items, null, 2));
  }
}

/**
 * Groups text items into rows based on Y coordinate proximity
 *
 * Algorithm:
 * 1. Sort all items by Y descending (PDF Y-axis is bottom-up)
 * 2. For each item, find an existing row whose Y is within tolerance
 * 3. If found, add item to that row
 * 4. If not found, create a new row
 * 5. Sort each row's items left-to-right by X
 * 6. Return rows as string[][] (array of rows, each row is array of cell strings)
 *
 * @param {object[]} items - raw items from extractRawItems()
 * @param {number} tolerance - Y px tolerance for same-row grouping (default: 3)
 * @returns {string[][]} rows
 */
function groupItemsIntoRows(items, tolerance = 3) {
  if (!items || items.length === 0) return [];

  // Each bucket: { y: number, items: { x, str }[] }
  const buckets = [];

  for (const item of items) {
    if (!item.str || item.str.trim() === "") continue;

    const itemY = item.y;

    // Find existing bucket within tolerance
    const bucket = buckets.find((b) => Math.abs(b.y - itemY) <= tolerance);

    if (bucket) {
      bucket.items.push({ x: item.x, str: item.str });
    } else {
      buckets.push({
        y: itemY,
        items: [{ x: item.x, str: item.str }],
      });
    }
  }

  // Sort buckets top-to-bottom (descending Y because PDF is bottom-up)
  buckets.sort((a, b) => b.y - a.y);

  // For each bucket, sort items left-to-right and extract strings
  const rows = buckets.map((bucket) => {
    bucket.items.sort((a, b) => a.x - b.x);
    return bucket.items.map((i) => i.str.trim()).filter(Boolean);
  });

  // Remove empty rows
  return rows.filter((row) => row.length > 0);
}

/**
 * Extracts rows from all pages of a PDF document
 *
 * @param {PDFDocumentProxy} pdf
 * @returns {Promise<string[][]>} all rows across all pages
 */
async function extractAllRows(pdf) {
  const allRows = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const items = await extractRawItems(page);
    const rows = groupItemsIntoRows(items);
    allRows.push(...rows);
  }

  return allRows;
}

/**
 * Extracts full text string from all pages
 * Used for bank detection
 *
 * @param {PDFDocumentProxy} pdf
 * @return {Promise<string>}
 */
async function extractFullText(pdf) {
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const items = await extractRawItems(page);
    fullText += " " + items.map((i) => i.str).join(" ");
  }

  return fullText.trim();
}

module.exports = {
  extractRawItems,
  printRawItemsJson,
  groupItemsIntoRows,
  extractAllRows,
  extractFullText,
};
