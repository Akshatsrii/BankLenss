/**
 * Ledger.jsx
 *
 * Page for managing manual/expected ledger entries.
 * Features a modern, digital ledger book theme with stat cards,
 * a list of manual entries, and a modal to create new expected transactions.
 */

import { useState, useEffect, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import {
  Plus, BookOpen, Calendar, ArrowUpCircle, ArrowDownCircle,
  Hash, DollarSign, Tag, RefreshCw, X, AlertCircle, Loader2
} from "lucide-react";

const addLedgerEntryFn = httpsCallable(functions, "addLedgerEntry");
const listLedgerEntriesFn = httpsCallable(functions, "listLedgerEntries");

const CATEGORIES = [
  "Salary", "Food", "Rent", "Utility", "Shopping",
  "Transport", "ATM", "Investment", "Health", "Transfer", "Other"
];

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className="p-5 rounded-2xl border flex flex-col gap-2"
      style={{
        backgroundColor: "#12161F",
        borderColor: "#1F2530",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="p-1.5 rounded-lg text-sm" style={{ backgroundColor: `${color}1A`, color }}>
          {icon}
        </span>
      </div>
      <p className="text-xl font-bold text-slate-100 font-mono">
        {value}
      </p>
    </div>
  );
}

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ credit: 0, debit: 0, count: 0 });

  // Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "debit",
    category: "Other",
    referenceNo: "",
  });

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listLedgerEntriesFn();
      const list = response.data?.data || [];
      setEntries(list);

      // Compute simple stats
      let credit = 0;
      let debit = 0;
      list.forEach((e) => {
        if (e.type === "credit") credit += e.amount;
        else debit += e.amount;
      });

      setStats({ credit, debit, count: list.length });
    } catch (err) {
      console.error("[Ledger] Error fetching entries:", err);
      setError(err.message || "Failed to load ledger entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await addLedgerEntryFn({
        ...form,
        amount: parseFloat(form.amount),
      });

      setShowModal(false);
      // Reset form
      setForm({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "debit",
        category: "Other",
        referenceNo: "",
      });

      await fetchLedger();
    } catch (err) {
      console.error("[Ledger] Error adding entry:", err);
      setError(err.message || "Failed to save entry. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-500" size={24} />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Ledger Book
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Add and manage your expected internal transaction records to match with statements.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                       text-sm font-semibold transition-transform duration-200
                       hover:-translate-y-0.5 active:translate-y-0 text-white"
            style={{ backgroundColor: "#3b82f6" }}
          >
            <Plus size={16} /> Add expected entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Expected Credits (Income)"
            value={`₹${stats.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={<ArrowUpCircle size={16} />}
            color="#34D399"
          />
          <StatCard
            label="Expected Debits (Expenses)"
            value={`₹${stats.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={<ArrowDownCircle size={16} />}
            color="#F87171"
          />
          <StatCard
            label="Total Entries"
            value={stats.count}
            icon={<RefreshCw size={16} />}
            color="#60A5FA"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Entries Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#12161F]/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#12161F]">
                <tr className="border-b border-slate-800 text-left text-slate-500 text-xs uppercase font-semibold">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Reference No</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-48" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      No ledger entries found. Click "Add expected entry" to record one!
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        {entry.date}
                      </td>
                      <td className="px-5 py-4 text-slate-200">
                        {entry.description}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        {entry.referenceNo || "—"}
                      </td>
                      <td className={`px-5 py-4 text-right font-mono text-xs font-bold ${
                        entry.type === "credit" ? "text-green-400" : "text-red-400"
                      }`}>
                        {entry.type === "credit" ? "+" : "-"} ₹{entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: "#12161F",
              borderColor: "#1F2530",
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <BookOpen size={18} className="text-blue-500" /> Add expected entry
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Calendar size={12} /> Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <BookOpen size={12} /> Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Rent, Salary deposit, Electric bill"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <DollarSign size={12} /> Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="debit">Debit (-) </option>
                    <option value="credit">Credit (+)</option>
                  </select>
                </div>
              </div>

              {/* Category & Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Tag size={12} /> Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Hash size={12} /> Reference No
                  </label>
                  <input
                    type="text"
                    name="referenceNo"
                    placeholder="e.g. UPI Ref, Check#"
                    value={form.referenceNo}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0E17] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
