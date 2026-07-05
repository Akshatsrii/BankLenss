/**
 * testParser.js
 *
 * CLI tool for local testing
 *
 * Usage:
 *   node testParser.js <pdf-path> [password] [--inspect]
 *
 * --inspect flag prints raw JSON items before parsing
 * Useful for understanding a new bank's PDF layout
 */

const fs = require("fs");
const path = require("path");
const { parseStatement, ERRORS } = require("./parsers/index");
const { unlockPdf } = require("./utils/unlockPdf");
const { printRawItemsJson, extractAllRows } = require("./utils/extractRows");
const { detectBank } = require("./utils/detectBank");
const { extractFullText } = require("./utils/extractRows");

async function run() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node testParser.js <pdf-path> [password] [--inspect]");
    console.log("  --inspect   print raw JSON items per page");
    process.exit(1);
  }

  const pdfPath = args[0];
  const password = args.find((a) => !a.startsWith("--") && a !== pdfPath) || "";
  const inspect = args.includes("--inspect");

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ File not found: ${pdfPath}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(path.resolve(pdfPath));

  console.log(`\n📄 File: ${pdfPath}`);
  console.log(`🔑 Password: ${password || "(none)"}\n`);

  // --inspect mode: print raw items as JSON then exit
  if (inspect) {
    console.log("🔍 INSPECT MODE — printing raw text items as JSON\n");
    try {
      const pdf = await unlockPdf(buffer, password);
      await printRawItemsJson(pdf, 2); // first 2 pages only
    } catch (err) {
      console.error(`❌ [${err.code}] ${err.message}`);
    }
    return;
  }

  // Normal mode: full parse
  try {
    const result = await parseStatement(buffer, password);

    console.log(`✅ Bank detected : ${result.bank}`);
    console.log(`📊 Transactions  : ${result.transactions.length}\n`);

    if (result.transactions.length === 0) {
      console.warn("⚠️  No transactions extracted.");
      console.warn("    Try --inspect to view raw PDF items and debug the parser.");
      return;
    }

    // Preview first 10
    const preview = result.transactions.slice(0, 10);
    console.log("First 10 transactions:\n");
    console.table(
      preview.map((t) => ({
        date: t.date,
        description: t.description.slice(0, 35),
        debit: t.debit,
        credit: t.credit,
        balance: t.balance,
        type: t.type,
      }))
    );

    // Summary
    const totalDebit = result.transactions.reduce((s, t) => s + t.debit, 0);
    const totalCredit = result.transactions.reduce((s, t) => s + t.credit, 0);

    console.log(`\n💸 Total Debit  : ₹${totalDebit.toFixed(2)}`);
    console.log(`💰 Total Credit : ₹${totalCredit.toFixed(2)}`);
  } catch (err) {
    console.error(`\n❌ Error [${err.code}]: ${err.message}`);

    if (err.code === ERRORS.WRONG_PASSWORD) {
      console.error("→ Check the password in docs/samples.md");
    } else if (err.code === ERRORS.UNSUPPORTED_BANK) {
      console.error("→ Add a new parser in functions/parsers/");
    } else if (err.code === ERRORS.CORRUPT_PDF) {
      console.error("→ The PDF file may be damaged or not a bank statement");
    }
  }
}

run();
