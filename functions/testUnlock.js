/**
 * testUnlock.js
 *
 * Tests unlockPdf() error handling against real files
 *
 * Usage:
 *   node testUnlock.js <pdf-path> [password]
 *
 * Tests run:
 *   1. Correct password       → should open
 *   2. Wrong password         → should throw WRONG_PASSWORD
 *   3. Empty password         → should throw WRONG_PASSWORD (if protected)
 *   4. Fake/corrupt buffer    → should throw CORRUPT_PDF
 */

const fs = require("fs");
const path = require("path");
const { unlockPdf, PDF_ERRORS } = require("./utils/unlockPdf");

async function runTests(pdfPath, correctPassword) {
  const buffer = fs.readFileSync(path.resolve(pdfPath));

  console.log(`\n📄 Testing: ${pdfPath}`);
  console.log("=".repeat(50));

  // Test 1: Correct password
  try {
    const pdf = await unlockPdf(buffer, correctPassword);
    console.log(`✅ Test 1 PASSED — Correct password opened PDF (${pdf.numPages} pages)`);
  } catch (err) {
    console.error(`❌ Test 1 FAILED — ${err.code}: ${err.message}`);
  }

  // Test 2: Wrong password
  try {
    await unlockPdf(buffer, "DEFINITELYWRONG123");
    console.error("❌ Test 2 FAILED — Should have thrown WRONG_PASSWORD");
  } catch (err) {
    if (err.code === PDF_ERRORS.WRONG_PASSWORD) {
      console.log(`✅ Test 2 PASSED — Wrong password correctly threw WRONG_PASSWORD`);
    } else {
      console.error(`❌ Test 2 FAILED — Got ${err.code} instead of WRONG_PASSWORD`);
    }
  }

  // Test 3: Empty password
  try {
    await unlockPdf(buffer, "");
    console.log(`⚠️  Test 3 NOTE  — Empty password opened PDF (not password-protected)`);
  } catch (err) {
    if (err.code === PDF_ERRORS.WRONG_PASSWORD) {
      console.log(`✅ Test 3 PASSED — Empty password correctly threw WRONG_PASSWORD`);
    } else {
      console.error(`❌ Test 3 FAILED — Got ${err.code}: ${err.message}`);
    }
  }

  // Test 4: Corrupt buffer
  try {
    const fakeBuffer = Buffer.from("this is not a pdf file at all");
    await unlockPdf(fakeBuffer, "");
    console.error("❌ Test 4 FAILED — Should have thrown CORRUPT_PDF");
  } catch (err) {
    if (err.code === PDF_ERRORS.CORRUPT_PDF) {
      console.log(`✅ Test 4 PASSED — Corrupt buffer correctly threw CORRUPT_PDF`);
    } else {
      console.error(`❌ Test 4 FAILED — Got ${err.code}: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("All unlock tests complete.\n");
}

const pdfPath = process.argv[2];
const password = process.argv[3] || "";

if (!pdfPath) {
  console.error("Usage: node testUnlock.js <pdf-path> [password]");
  process.exit(1);
}

runTests(pdfPath, password).catch(console.error);