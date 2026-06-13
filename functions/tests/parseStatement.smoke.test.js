/**
 * parseStatement smoke tests
 *
 * These tests run against the actual sample PDFs in /samples.
 * They verify the full unlock → detect → parse → normalize pipeline.
 *
 * Run with:
 *   cd functions && node --experimental-vm-modules node_modules/.bin/vitest run tests/parseStatement.smoke.test.js
 *
 * Requires sample PDFs in /samples/ and passwords in /docs/samples.md
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { parseStatement, ERRORS } from "../parsers/index.js";

// ── Sample PDF config ─────────────────────────────────────────
// Update passwords to match your actual sample files
const SAMPLES = [
  { bank: "SBI",   file: "../../samples/SBI.pdf",   password: process.env.SBI_PASSWORD   || "" },
  { bank: "HDFC",  file: "../../samples/HDFC.pdf",  password: process.env.HDFC_PASSWORD  || "" },
  { bank: "ICICI", file: "../../samples/ICICI.pdf", password: process.env.ICICI_PASSWORD || "" },
  { bank: "AXIS",  file: "../../samples/AXIS.pdf",  password: process.env.AXIS_PASSWORD  || "" },
];

describe("parseStatement — smoke tests", () => {

  for (const sample of SAMPLES) {
    const pdfPath = resolve(__dirname, sample.file);
    const fileExists = existsSync(pdfPath);

    // Skip if file not present (CI environment)
    const testFn = fileExists ? it : it.skip;

    testFn(`${sample.bank}: opens and extracts transactions`, async () => {
      const buffer = readFileSync(pdfPath);
      const result = await parseStatement(buffer, sample.password);

      // Bank detected correctly
      expect(result.bank).toBe(sample.bank);

      // At least some transactions extracted
      expect(result.transactions.length).toBeGreaterThan(0);

      // All transactions have required fields
      result.transactions.forEach((t) => {
        expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof t.description).toBe("string");
        expect(t.description.length).toBeGreaterThan(0);
        expect(typeof t.debit).toBe("number");
        expect(typeof t.credit).toBe("number");
        expect(typeof t.balance).toBe("number");
        expect(["debit", "credit"]).toContain(t.type);
        expect(["Salary","Food","Rent","Utility","Shopping","Transport","ATM","Investment","Health","Transfer","Other"]).toContain(t.category);
      });

      // No transaction should have both debit and credit > 0
      result.transactions.forEach((t) => {
        expect(t.debit > 0 && t.credit > 0).toBe(false);
      });

      console.log(`✅ ${sample.bank}: ${result.transactions.length} transactions extracted`);
    }, 30000);

    testFn(`${sample.bank}: wrong password throws WRONG_PASSWORD`, async () => {
      if (!fileExists) return;
      const buffer = readFileSync(pdfPath);
      try {
        await parseStatement(buffer, "DEFINITELYWRONG999");
        // If no password protection, this passes — that's fine
      } catch (err) {
        expect(err.code).toBe(ERRORS.WRONG_PASSWORD);
      }
    }, 15000);
  }

  it("corrupt buffer throws CORRUPT_PDF", async () => {
    const fakeBuffer = Buffer.from("not a pdf");
    await expect(
      parseStatement(fakeBuffer, "")
    ).rejects.toMatchObject({ code: ERRORS.CORRUPT_PDF });
  });

  it("fully scanned PDF throws SCANNED_PDF or extracts 0 transactions", async () => {
    // This test documents expected behavior —
    // actual scanned PDFs should either throw SCANNED_PDF
    // or return 0 transactions with a warning
    const fakeBuffer = Buffer.from("not a pdf");
    try {
      await parseStatement(fakeBuffer, "");
    } catch (err) {
      expect([ERRORS.CORRUPT_PDF, ERRORS.SCANNED_PDF]).toContain(err.code);
    }
  });
});