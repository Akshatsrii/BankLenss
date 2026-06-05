const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

async function readPdf(filePath) {
  console.log(`\n📄 Reading PDF: ${filePath}\n`);

  const loadingTask = pdfjsLib.getDocument(filePath);

  const pdf = await loadingTask.promise;

  console.log(`Total pages: ${pdf.numPages}\n`);

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

    const page = await pdf.getPage(pageNum);

    const content = await page.getTextContent();

    const text = content.items
      .map((item) => item.str)
      .join(" ");

    console.log(`--- Page ${pageNum} ---`);
    console.log(text);
    console.log("");
  }

  console.log("✅ PDF reading complete.");
}

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error("Usage: node testPdf.js <path-to-pdf>");
  process.exit(1);
}

readPdf(pdfPath).catch((err) => {
  console.error("❌ Error reading PDF:", err.message);
});