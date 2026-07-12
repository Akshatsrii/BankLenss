import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { parseStatement } from "../parsers/index.js";
import { hashTransaction } from "../utils/hashTransaction.js";

/**
 * processStatement (Client-Side)
 * Reads file buffer, runs the PDF parser, and uploads results to Firestore.
 */
export async function processStatement({ fileBuffer, password, fileName, onStep }) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthenticated");

  // Step 1: Parse the statement in-memory
  const { bank, transactions, warnings } = await parseStatement(fileBuffer, password, onStep);

  // Step 2: Write statement doc to Firestore
  if (onStep) onStep("save");
  const statementRef = doc(collection(db, "statements"));
  const statementId = statementRef.id;

  const statementDoc = {
    statementId,
    userId,
    bankName: bank,
    fileName,
    uploadedAt: serverTimestamp(),
    transactionCount: transactions.length,
    status: "done",
  };

  await setDoc(statementRef, statementDoc);

  // Step 3: Batch-write transactions (chunking in batches of 500)
  const CHUNK_SIZE = 500;
  for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
    const chunk = transactions.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const t of chunk) {
      const txId = await hashTransaction(userId, t);
      const txRef = doc(db, "transactions", txId);

      batch.set(txRef, {
        transactionId: txId,
        statementId,
        userId,
        date: t.date,
        description: t.description,
        debit: t.debit,
        credit: t.credit,
        balance: t.balance,
        type: t.type,
        category: t.category || "Other",
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }

  return {
    data: {
      statementId,
      bank,
      transactionCount: transactions.length,
      warnings: warnings.map((w) => w.message),
    },
  };
}

/**
 * listTransactions (Client-Side)
 * Fetches transactions matching filters, performs in-memory operations and ledger matching.
 */
export async function listTransactions(filters) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthenticated");

  // Query ONLY by userId. This is 100% index-free and runs instantly!
  const q = query(collection(db, "transactions"), where("userId", "==", userId));

  const snapshot = await getDocs(q);
  let results = snapshot.docs.map((doc) => doc.data());

  // 1. Filter by statementId in-memory
  if (filters.statementId) {
    results = results.filter((t) => t.statementId === filters.statementId);
  }

  // 2. Filter by date range (from / to) in-memory
  if (filters.from) {
    results = results.filter((t) => t.date >= filters.from);
  }
  if (filters.to) {
    results = results.filter((t) => t.date <= filters.to);
  }

  // 3. Filter by type (debit / credit) in-memory
  if (filters.type && filters.type !== "all") {
    results = results.filter((t) => t.type === filters.type);
  }

  // 4. Sort newest first in-memory (No orderBy index required)
  results.sort((a, b) => b.date.localeCompare(a.date));

  // In-memory filter on amounts
  if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== "") {
    const min = parseFloat(filters.minAmount);
    if (!isNaN(min)) {
      results = results.filter((t) => t.debit >= min || t.credit >= min);
    }
  }

  if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== "") {
    const max = parseFloat(filters.maxAmount);
    if (!isNaN(max)) {
      results = results.filter(
        (t) => (t.debit > 0 && t.debit <= max) || (t.credit > 0 && t.credit <= max)
      );
    }
  }

  // In-memory description search
  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().toLowerCase();
    results = results.filter((t) => (t.description || "").toLowerCase().includes(term));
  }

  // In-memory category filter
  if (filters.category && filters.category !== "all") {
    results = results.filter((t) => t.category === filters.category);
  }

  // Ledger entry dynamic reconciliation
  const ledgerSnapshot = await getDocs(
    query(collection(db, "ledger_entries"), where("userId", "==", userId))
  );
  const ledgerEntries = ledgerSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const matchedLedgerIds = new Set();
  results = results.map((t) => {
    let match = null;
    if (t.matchedLedgerEntryId) {
      match = ledgerEntries.find((l) => l.id === t.matchedLedgerEntryId);
    }

    if (!match) {
      const amount = t.type === "credit" ? t.credit : t.debit;
      match = ledgerEntries.find((l) => {
        if (matchedLedgerIds.has(l.id)) return false;
        if (l.type !== t.type) return false;
        if (Math.abs(l.amount - amount) >= 0.01) return false;

        const tDate = new Date(t.date);
        const lDate = new Date(l.date);
        const diffMs = Math.abs(tDate - lDate);
        return diffMs <= 3 * 24 * 60 * 60 * 1000;
      });
    }

    if (match) {
      matchedLedgerIds.add(match.id);
      return {
        ...t,
        status: "matched",
        matchedLedger: match,
      };
    } else {
      return {
        ...t,
        status: "unmatched",
        matchedLedger: null,
      };
    }
  });

  if (filters.status && filters.status !== "all") {
    results = results.filter((t) => t.status === filters.status);
  }

  const page = parseInt(filters.page) || 1;
  const pageSize = parseInt(filters.pageSize) || 20;
  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const paginated = results.slice(offset, offset + pageSize);

  return {
    data: {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

/**
 * listStatements (Client-Side)
 * Fetches statement documents for selector / dashboard listings.
 */
export async function listStatements() {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthenticated");

  // Query ONLY by userId (index-free!)
  const q = query(
    collection(db, "statements"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      statementId: d.statementId,
      bankName: d.bankName,
      fileName: d.fileName,
      transactionCount: d.transactionCount,
      uploadedAtRaw: d.uploadedAt, // keep raw reference for sorting
      uploadedAt: d.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: d.status,
    };
  });

  // Sort by uploadedAt descending in-memory
  data.sort((a, b) => {
    const aTime = a.uploadedAtRaw?.toDate?.()?.getTime() || 0;
    const bTime = b.uploadedAtRaw?.toDate?.()?.getTime() || 0;
    return bTime - aTime;
  });

  return { data: { data } };
}

/**
 * addLedgerEntry (Client-Side)
 * Stores a manual ledger entry.
 */
export async function addLedgerEntry(entryData) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthenticated");

  const ledgerRef = doc(collection(db, "ledger_entries"));
  const entry = {
    id: ledgerRef.id,
    userId,
    date: entryData.date,
    description: entryData.description,
    amount: parseFloat(entryData.amount),
    type: entryData.type,
    category: entryData.category || "Other",
    referenceNo: entryData.referenceNo || "",
    createdAt: serverTimestamp(),
  };

  await setDoc(ledgerRef, entry);
  return { data: entry };
}

/**
 * listLedgerEntries (Client-Side)
 * Fetches ledger entries.
 */
export async function listLedgerEntries({ page = 1, pageSize = 20 } = {}) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Unauthenticated");

  // Query ONLY by userId (index-free!)
  const q = query(
    collection(db, "ledger_entries"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Sort by date descending in-memory
  results.sort((a, b) => {
    const aDate = a.date || "";
    const bDate = b.date || "";
    return bDate.localeCompare(aDate);
  });

  const currentPage = Math.max(1, parseInt(page) || 1);
  const size = Math.max(1, parseInt(pageSize) || 20);
  const total = results.length;
  const totalPages = Math.ceil(total / size);
  const offset = (currentPage - 1) * size;
  const paginated = results.slice(offset, offset + size);

  return {
    data: {
      data: paginated,
      total,
      page: currentPage,
      pageSize: size,
      totalPages,
    },
  };
}
