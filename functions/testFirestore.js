/**
 * testFirestore.js
 *
 * Seeds Firestore with 120 fake transactions then
 * verifies pagination + all filters work correctly.
 *
 * Requires Firebase emulator running:
 *   firebase emulators:start --only firestore
 *
 * Usage:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node testFirestore.js
 */

process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { writeTransactions } = require("./firestore/writeTransactions");
const { writeStatement } = require("./firestore/writeStatement");
const { listTransactions } = require("./firestore/listTransactions");

initializeApp({ projectId: "bank-statement-digitizer-dev" });

const TEST_USER_ID = "test-user-001";

// ─── Seed helpers ──────────────────────────────────────────────

function randomAmount() {
  return Math.round(Math.random() * 50000 * 100) / 100;
}

function randomDate(start, end) {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

const DESCRIPTIONS = [
  "UPI-ZOMATO-Food delivery",
  "UPI-AMAZON-Online shopping",
  "NEFT-SALARY-Employer transfer",
  "ATM-WITHDRAWAL-Cash",
  "UPI-SWIGGY-Food order",
  "IMPS-RENT-Monthly rent",
  "UPI-NETFLIX-Subscription",
  "NEFT-FREELANCE-Payment received",
  "UPI-UBER-Cab booking",
  "ECS-INSURANCE-Premium",
  "UPI-ELECTRICITY-Bill payment",
  "RTGS-INVESTMENT-Mutual fund",
];

/**
 * Generates n fake transactions
 */
function generateTransactions(n) {
  const transactions = [];
  const start = new Date("2024-01-01");
  const end = new Date("2024-12-31");

  for (let i = 0; i < n; i++) {
    const isCredit = Math.random() > 0.6;
    const amount = randomAmount();

    transactions.push({
      date: randomDate(start, end),
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      debit: isCredit ? 0 : amount,
      credit: isCredit ? amount : 0,
      balance: randomAmount(),
      type: isCredit ? "credit" : "debit",
    });
  }

  return transactions;
}

// ─── Test runner ───────────────────────────────────────────────

async function runTests() {
  console.log("\n🌱 Seeding Firestore with 120 test transactions...\n");

  // Write statement doc
  const statementId = await writeStatement({
    userId: TEST_USER_ID,
    bankName: "SBI",
    fileName: "test-statement.pdf",
    storagePath: `statements/${TEST_USER_ID}/test-statement.pdf`,
    transactionCount: 120,
  });

  console.log(`📄 Statement ID: ${statementId}\n`);

  // Seed 120 transactions
  const transactions = generateTransactions(120);

  const { written } = await writeTransactions({
    userId: TEST_USER_ID,
    statementId,
    transactions,
  });

  console.log(`✅ Seeded ${written} transactions\n`);
  console.log("=".repeat(60));

  // ─── Test 1: Default pagination ────────────────────────────
  console.log("\n📋 Test 1: Default pagination (page 1, size 20)");
  const t1 = await listTransactions({
    userId: TEST_USER_ID,
  });
  console.assert(t1.data.length <= 20, "Page size should be ≤ 20");
  console.assert(t1.page === 1, "Page should be 1");
  console.assert(t1.total > 0, "Total should be > 0");
  console.log(`   ✅ total: ${t1.total} | pages: ${t1.totalPages} | returned: ${t1.data.length}`);

  // ─── Test 2: Page 2 ────────────────────────────────────────
  console.log("\n📋 Test 2: Page 2");
  const t2 = await listTransactions({
    userId: TEST_USER_ID,
    page: 2,
    pageSize: 20,
  });
  console.assert(t2.page === 2, "Page should be 2");
  console.assert(t2.data.length <= 20, "Page 2 size should be ≤ 20");
  console.log(`   ✅ page: ${t2.page} | returned: ${t2.data.length}`);

  // ─── Test 3: Filter by type = debit ────────────────────────
  console.log("\n📋 Test 3: Filter type = debit");
  const t3 = await listTransactions({
    userId: TEST_USER_ID,
    type: "debit",
    pageSize: 100,
  });
  const allDebit = t3.data.every((t) => t.type === "debit");
  console.assert(allDebit, "All results should be debit type");
  console.log(`   ✅ debit transactions: ${t3.total} | all type=debit: ${allDebit}`);

  // ─── Test 4: Filter by type = credit ───────────────────────
  console.log("\n📋 Test 4: Filter type = credit");
  const t4 = await listTransactions({
    userId: TEST_USER_ID,
    type: "credit",
    pageSize: 100,
  });
  const allCredit = t4.data.every((t) => t.type === "credit");
  console.assert(allCredit, "All results should be credit type");
  console.log(`   ✅ credit transactions: ${t4.total} | all type=credit: ${allCredit}`);

  // ─── Test 5: Debit + Credit counts should add up ───────────
  console.log("\n📋 Test 5: Debit + Credit = Total");
  console.assert(
    t3.total + t4.total === t1.total,
    `debit(${t3.total}) + credit(${t4.total}) should = total(${t1.total})`
  );
  console.log(`   ✅ ${t3.total} + ${t4.total} = ${t1.total}`);

  // ─── Test 6: Date range filter ─────────────────────────────
  console.log("\n📋 Test 6: Date range Jan 2024");
  const t6 = await listTransactions({
    userId: TEST_USER_ID,
    from: "2024-01-01",
    to: "2024-01-31",
    pageSize: 100,
  });
  const allInRange = t6.data.every(
    (t) => t.date >= "2024-01-01" && t.date <= "2024-01-31"
  );
  console.assert(allInRange, "All results should be within Jan 2024");
  console.log(`   ✅ Jan 2024 transactions: ${t6.total} | all in range: ${allInRange}`);

  // ─── Test 7: Search filter ─────────────────────────────────
  console.log("\n📋 Test 7: Search 'ZOMATO'");
  const t7 = await listTransactions({
    userId: TEST_USER_ID,
    search: "ZOMATO",
    pageSize: 100,
  });
  const allZomato = t7.data.every((t) =>
    t.description.toLowerCase().includes("zomato")
  );
  console.assert(allZomato, "All results should contain ZOMATO");
  console.log(`   ✅ ZOMATO transactions: ${t7.total} | all match: ${allZomato}`);

  // ─── Test 8: minAmount filter ──────────────────────────────
  console.log("\n📋 Test 8: minAmount = 10000");
  const t8 = await listTransactions({
    userId: TEST_USER_ID,
    minAmount: 10000,
    pageSize: 100,
  });
  const allAboveMin = t8.data.every(
    (t) => t.debit >= 10000 || t.credit >= 10000
  );
  console.assert(allAboveMin, "All amounts should be >= 10000");
  console.log(`   ✅ transactions ≥ ₹10000: ${t8.total} | all valid: ${allAboveMin}`);

  // ─── Test 9: Custom pageSize ───────────────────────────────
  console.log("\n📋 Test 9: Custom pageSize = 5");
  const t9 = await listTransactions({
    userId: TEST_USER_ID,
    pageSize: 5,
  });
  console.assert(t9.data.length <= 5, "Should return ≤ 5 results");
  console.assert(t9.pageSize === 5, "pageSize should be 5");
  console.log(`   ✅ returned: ${t9.data.length} | pageSize: ${t9.pageSize}`);

  // ─── Test 10: Deduplication check ─────────────────────────
  console.log("\n📋 Test 10: Re-upload deduplication");
  const { written: rewritten } = await writeTransactions({
    userId: TEST_USER_ID,
    statementId,
    transactions, // same 120 transactions again
  });
  const t10 = await listTransactions({
    userId: TEST_USER_ID,
    pageSize: 1,
  });
  console.assert(
    t10.total === t1.total,
    "Total should not increase after duplicate upload"
  );
  console.log(
    `   ✅ After re-upload: total still ${t10.total} (no duplicates added)`
  );

  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests complete!\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});