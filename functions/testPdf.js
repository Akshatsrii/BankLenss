const fs = require("fs");
const path = require("path");
const { parseStatement, ERRORS } = require("./parsers");

async function test() {
  const pdfPath = process.argv[2];
  const password = process.argv[3] || "";

  if (!pdfPath) {
    console.error("Usage: node testParser.js <pdf-path> [password]");
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(path.resolve(pdfPath));

    const result = await parseStatement(buffer, password);

    console.log(`\n✅ Bank detected: ${result.bank}`);
    console.log(`📊 Transactions found: ${result.transactions.length}\n`);

    console.table(result.transactions.slice(0, 5));
  } catch (err) {
    console.error(`\n❌ Error [${err.code || "UNKNOWN"}]: ${err.message}`);

    switch (err.code) {
      case ERRORS.WRONG_PASSWORD:
        console.error("→ Check the password in docs/samples.md");
        break;

      case ERRORS.UNSUPPORTED_BANK:
        console.error("→ Add a new parser in functions/parsers/");
        break;

      case ERRORS.CORRUPT_PDF:
        console.error("→ The PDF file may be damaged");
        break;

      default:
        console.error(err);
    }

    process.exit(1);
  }
}

test();
