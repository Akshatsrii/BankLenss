/**
 * addLedgerEntry.js
 *
 * Saves a manual ledger entry in Firestore.
 */

const {getFirestore, FieldValue} = require('firebase-admin/firestore');

/**
 * @param {object} params
 * @returns {Promise<object>} created entry
 */
async function addLedgerEntry({userId, date, description, amount, type, category, referenceNo}) {
  const db = getFirestore();

  if (!userId) throw new Error('userId is required.');
  if (!date) throw new Error('date is required.');
  if (!description) throw new Error('description is required.');
  if (amount === undefined || isNaN(amount)) throw new Error('amount must be a valid number.');
  if (!type || (type !== 'debit' && type !== 'credit')) {
    throw new Error('type must be \'debit\' or \'credit\'.');
  }

  const ledgerRef = db.collection('ledger_entries').doc();
  const entry = {
    id: ledgerRef.id,
    userId,
    date,
    description,
    amount: parseFloat(amount),
    type,
    category: category || 'Other',
    referenceNo: referenceNo || '',
    createdAt: FieldValue.serverTimestamp(),
  };

  await ledgerRef.set(entry);
  return entry;
}

module.exports = {addLedgerEntry};
