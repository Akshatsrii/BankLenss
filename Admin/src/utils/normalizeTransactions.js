/**
 * normalizeTransactions.js
 *
 * Validates and cleans raw parser output before it goes into Firestore.
 */

function normalizeTransactions(transactions) {
  const cleaned = [];

  for (const t of transactions) {
    if (!t.date || t.date.trim() === "") {
      console.warn("[normalize] Skipped row — missing date:", t);
      continue;
    }

    if (!t.description || t.description.trim() === "") {
      console.warn("[normalize] Skipped row — missing description:", t);
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date.trim())) {
      console.warn("[normalize] Skipped row — invalid date format:", t.date);
      continue;
    }

    const debit = Math.max(0, Number(t.debit) || 0);
    const credit = Math.max(0, Number(t.credit) || 0);
    const balance = Number(t.balance) || 0;

    if (debit === 0 && credit === 0) {
      console.warn("[normalize] Skipped row — zero debit and credit:", t);
      continue;
    }

    let type = t.type;
    if (type !== "debit" && type !== "credit") {
      type = credit > 0 ? "credit" : "debit";
    }

    cleaned.push({
      date: t.date.trim(),
      description: t.description.trim(),
      debit,
      credit,
      balance,
      type,
    });
  }

  console.log(`[normalize] ${transactions.length} raw → ${cleaned.length} valid transactions`);

  return cleaned;
}

export { normalizeTransactions };
