const fs = require("fs");
const path = require("path");
const { parseStatement, ERRORS } = require("./parsers/index");

async function test() {
  const pdfPath = process.argv[2];
  const password = process.argv[3] || "";

  if (!pdfPath) {
    console.error("Usage: node testParser.js <pdf-path> [password]");
    process.exit(1);
  }

  const buffer = fs.readFileSync(path.resolve(pdfPath));

  try {
    const result = await parseStatement(buffer, password);

    console.log(`\n✅ Bank detected: ${result.bank}`);
    console.log(`📊 Transactions found: ${result.transactions.length}\n`);

    // Print first 5 transactions as preview
    const preview = result.transactions.slice(0, 5);
    console.table(preview);

  } catch (err) {
    console.error(`\n❌ Error [${err.code}]: ${err.message}`);

    if (err.code === ERRORS.WRONG_PASSWORD) {
      console.error("→ Check the password in docs/samples.md");
    } else if (err.code === ERRORS.UNSUPPORTED_BANK) {
      console.error("→ Add a new parser in functions/parsers/");
    } else if (err.code === ERRORS.CORRUPT_PDF) {
      console.error("→ The PDF file may be damaged");
    }
  }
}

test();