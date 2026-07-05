import { describe, it, expect } from "vitest";
import { parse, detect } from "../parsers/hdfc.js";
import { HDFC_ROWS, HDFC_EXPECTED } from "./fixtures/hdfc.fixture.js";

describe("HDFC Parser — detect()", () => {
  it("detects HDFC BANK uppercase", () => {
    expect(detect("HDFC BANK Account Statement")).toBe(true);
  });

  it("detects HDFC Bank mixed case", () => {
    expect(detect("HDFC Bank Savings Account")).toBe(true);
  });

  it("does NOT detect SBI as HDFC", () => {
    expect(detect("State Bank of India")).toBe(false);
  });

  it("does NOT detect Axis as HDFC", () => {
    expect(detect("Axis Bank Limited")).toBe(false);
  });
});

describe("HDFC Parser — parse()", () => {
  const result = parse(HDFC_ROWS);

  it("extracts correct number of transactions", () => {
    expect(result).toHaveLength(HDFC_EXPECTED.length);
  });

  it("skips opening/closing balance rows", () => {
    const hasBal = result.some((t) => t.description.toLowerCase().includes("balance"));
    expect(hasBal).toBe(false);
  });

  it("parses DD-MMM-YYYY dates to YYYY-MM-DD", () => {
    result.forEach((t) => {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("parses salary deposit correctly", () => {
    const salary = result.find((t) => t.description.includes("SALARY"));
    expect(salary).toBeDefined();
    expect(salary.type).toBe("credit");
    expect(salary.credit).toBe(95000);
  });

  it("parses rent withdrawal correctly", () => {
    const rent = result.find((t) => t.description.includes("RENT"));
    expect(rent).toBeDefined();
    expect(rent.type).toBe("debit");
    expect(rent.debit).toBe(18000);
  });

  it("no transaction has both debit and credit > 0", () => {
    result.forEach((t) => {
      expect(t.debit > 0 && t.credit > 0).toBe(false);
    });
  });

  it("matches all expected transactions", () => {
    HDFC_EXPECTED.forEach((expected, i) => {
      expect(result[i]).toMatchObject(expected);
    });
  });
});
