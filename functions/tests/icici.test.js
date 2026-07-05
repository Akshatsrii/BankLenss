import { describe, it, expect } from "vitest";
import { parse, detect } from "../parsers/icici.js";
import { ICICI_ROWS, ICICI_EXPECTED } from "./fixtures/icici.fixture.js";

describe("ICICI Parser — detect()", () => {
  it("detects ICICI BANK uppercase", () => {
    expect(detect("ICICI BANK Account Statement")).toBe(true);
  });

  it("detects ICICI Bank mixed case", () => {
    expect(detect("ICICI Bank Savings Account")).toBe(true);
  });

  it("does NOT detect HDFC as ICICI", () => {
    expect(detect("HDFC BANK Statement")).toBe(false);
  });
});

describe("ICICI Parser — parse()", () => {
  const result = parse(ICICI_ROWS);

  it("extracts correct number of transactions", () => {
    expect(result).toHaveLength(ICICI_EXPECTED.length);
  });

  it("handles S.No column correctly", () => {
    // First transaction should start from row with serial number 2
    expect(result[0].date).toBe("2024-01-04");
  });

  it("skips closing balance row", () => {
    const hasBal = result.some((t) => t.description.toLowerCase().includes("closing"));
    expect(hasBal).toBe(false);
  });

  it("parses DD-MMM-YYYY dates to YYYY-MM-DD", () => {
    result.forEach((t) => {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("parses salary credit correctly", () => {
    const salary = result.find((t) => t.description.includes("SALARY"));
    expect(salary).toBeDefined();
    expect(salary.type).toBe("credit");
    expect(salary.credit).toBe(80000);
  });

  it("parses ATM debit correctly", () => {
    const atm = result.find((t) => t.description.includes("ATM"));
    expect(atm).toBeDefined();
    expect(atm.debit).toBe(8000);
  });

  it("parses investment debit correctly", () => {
    const inv = result.find((t) => t.description.includes("INVESTMENT"));
    expect(inv).toBeDefined();
    expect(inv.debit).toBe(10000);
    expect(inv.type).toBe("debit");
  });

  it("matches all expected transactions", () => {
    ICICI_EXPECTED.forEach((expected, i) => {
      expect(result[i]).toMatchObject(expected);
    });
  });
});
