import { describe, it, expect } from "vitest";
import { parse, detect } from "../parsers/axis.js";
import { AXIS_ROWS, AXIS_EXPECTED } from "./fixtures/axis.fixture.js";

describe("Axis Parser — detect()", () => {
  it("detects Axis Bank mixed case", () => {
    expect(detect("Axis Bank Limited Account Statement")).toBe(true);
  });

  it("detects AXIS BANK uppercase", () => {
    expect(detect("AXIS BANK Statement 2024")).toBe(true);
  });

  it("does NOT detect SBI as Axis", () => {
    expect(detect("State Bank of India")).toBe(false);
  });

  it("does NOT detect ICICI as Axis", () => {
    expect(detect("ICICI Bank Savings Account")).toBe(false);
  });
});

describe("Axis Parser — parse()", () => {
  const result = parse(AXIS_ROWS);

  it("extracts correct number of transactions", () => {
    expect(result).toHaveLength(AXIS_EXPECTED.length);
  });

  it("skips opening/closing balance rows", () => {
    const hasBal = result.some((t) => t.description.toLowerCase().includes("balance"));
    expect(hasBal).toBe(false);
  });

  it("parses DD-MM-YYYY dates to YYYY-MM-DD", () => {
    result.forEach((t) => {
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("parses salary credit correctly", () => {
    const salary = result.find((t) => t.description.includes("SALARY"));
    expect(salary).toBeDefined();
    expect(salary.type).toBe("credit");
    expect(salary.credit).toBe(70000);
  });

  it("parses rent debit correctly", () => {
    const rent = result.find((t) => t.description.includes("RENT"));
    expect(rent).toBeDefined();
    expect(rent.debit).toBe(12000);
  });

  it("all balances are numbers", () => {
    result.forEach((t) => {
      expect(typeof t.balance).toBe("number");
    });
  });

  it("matches all expected transactions", () => {
    AXIS_EXPECTED.forEach((expected, i) => {
      expect(result[i]).toMatchObject(expected);
    });
  });
});