import { describe, it, expect } from "vitest";
import { parse, detect } from "../parsers/sbi.js";
import { SBI_ROWS, SBI_EXPECTED } from "./fixtures/sbi.fixture.js";

describe("SBI Parser — detect()", () => {
  it("detects SBI from full bank name", () => {
    expect(detect("State Bank of India Account Statement")).toBe(true);
  });

  it("detects SBI from abbreviation + keyword", () => {
    expect(detect("SBI Account Statement 2024")).toBe(true);
  });

  it("detects SBI from SBIN code", () => {
    expect(detect("SBIN0012345 Branch Code")).toBe(true);
  });

  it("does NOT detect HDFC as SBI", () => {
    expect(detect("HDFC BANK Account Statement")).toBe(false);
  });

  it("does NOT detect ICICI as SBI", () => {
    expect(detect("ICICI Bank Account Statement")).toBe(false);
  });
});

describe("SBI Parser — parse()", () => {
  const result = parse(SBI_ROWS);

  it("extracts the correct number of transactions", () => {
    expect(result).toHaveLength(SBI_EXPECTED.length);
  });

  it("skips opening/closing balance rows", () => {
    const hasBal = result.some((t) =>
      t.description.toLowerCase().includes("balance")
    );
    expect(hasBal).toBe(false);
  });

  it("skips summary/total rows", () => {
    const hasTotal = result.some((t) =>
      t.description.toLowerCase().includes("total")
    );
    expect(hasTotal).toBe(false);
  });

  it("parses dates into YYYY-MM-DD format", () => {
    result.forEach((t) => {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("correctly identifies debit transactions", () => {
    const debits = result.filter((t) => t.type === "debit");
    expect(debits.every((t) => t.debit > 0 && t.credit === 0)).toBe(true);
  });

  it("correctly identifies credit transactions", () => {
    const credits = result.filter((t) => t.type === "credit");
    expect(credits.every((t) => t.credit > 0 && t.debit === 0)).toBe(true);
  });

  it("parses first transaction correctly", () => {
    expect(result[0]).toMatchObject(SBI_EXPECTED[0]);
  });

  it("parses salary credit correctly", () => {
    const salary = result.find((t) => t.description.includes("SALARY"));
    expect(salary).toBeDefined();
    expect(salary.type).toBe("credit");
    expect(salary.credit).toBe(85000);
  });

  it("parses ATM withdrawal correctly", () => {
    const atm = result.find((t) => t.description.includes("ATM"));
    expect(atm).toBeDefined();
    expect(atm.type).toBe("debit");
    expect(atm.debit).toBe(10000);
  });

  it("all amounts are non-negative numbers", () => {
    result.forEach((t) => {
      expect(typeof t.debit).toBe("number");
      expect(typeof t.credit).toBe("number");
      expect(t.debit).toBeGreaterThanOrEqual(0);
      expect(t.credit).toBeGreaterThanOrEqual(0);
    });
  });

  it("matches all expected transactions", () => {
    SBI_EXPECTED.forEach((expected, i) => {
      expect(result[i]).toMatchObject(expected);
    });
  });
});