/**
 * Ledger.jsx
 *
 * Page for managing manual/expected ledger entries.
 * Features a modern, digital ledger book theme with stat cards,
 * a list of manual entries, and a modal to create new expected transactions.
 */

import { useState, useEffect, useCallback } from "react";
import { addLedgerEntry as addLedgerEntryFn, listLedgerEntries as listLedgerEntriesFn } from "../services/api";
import {
  Plus, BookOpen, Calendar, ArrowUpCircle, ArrowDownCircle,
  Hash, DollarSign, Tag, RefreshCw, X, AlertCircle, Loader2
} from "lucide-react";

const CATEGORIES = [
  "Salary", "Food", "Rent", "Utility", "Shopping",
  "Transport", "ATM", "Investment", "Health", "Transfer", "Other"
];

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";
const RED        = "#F87171";
const BLUE       = "#60A5FA";

const FONT_STACK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes floatSlow{ 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes popIn    { from { opacity: 0; transform: scale(0.95) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes livePulse{
    0%   { box-shadow: 0 0 0 0 ${GREEN}66; }
    70%  { box-shadow: 0 0 0 6px ${GREEN}00; }
    100% { box-shadow: 0 0 0 0 ${GREEN}00; }
  }
`;

/* Decorative "passbook stub" divider — a perforated ledger edge */
function PassbookDivider() {
  return (
    <div className="flex items-center gap-1.5 px-1 select-none" aria-hidden="true">
      {Array.from({ length: 46 }).map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "#232838" }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, color, delay }) {
  return (
    <div
      className="relative p-5 rounded-2xl border flex flex-col gap-2 overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: SURFACE,
        borderColor: BORDER,
        animation: "fadeUp 0.5s ease both",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 14px 30px -16px ${color}70`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <span className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundColor: color, opacity: 0.85 }} />
      <span
        className="absolute -right-6 -top-6 w-16 h-16 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)` }}
      />
      <div className="flex items-center justify-between relative">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: TEXT_FAINT }}>
          {label}
        </span>
        <span className="p-1.5 rounded-lg text-sm" style={{ backgroundColor: `${color}1A`, color }}>
          {icon}
        </span>
      </div>
      <p
        className="text-xl font-bold relative"
        style={{ color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}
      >
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
    <div
      className="min-h-screen p-6 md:p-10 font-sans relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_STACK}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BLUE}0D, transparent 70%)` }}
      />

      <div className="max-w-6xl mx-auto space-y-6 relative">

        {/* Header */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap"
          style={{ animation: "fadeUp 0.45s ease both" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${GOLD}1A`,
                border: `1px solid ${GOLD}40`,
                animation: "floatSlow 4.5s ease-in-out infinite",
              }}
            >
              <BookOpen size={19} style={{ color: GOLD_SOFT }} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>
                Manual Records
              </p>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                Ledger Book
              </h1>
              <p className="text-sm mt-1" style={{ color: TEXT_FAINT }}>
                Add and manage your expected internal transaction records to match with statements.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                       text-sm font-semibold transition-all duration-200
                       hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: GOLD, color: INK }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_SOFT)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <Plus size={16} /> Add expected entry
          </button>
        </div>

        <PassbookDivider />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Expected Credits (Income)"
            value={`₹${stats.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={<ArrowUpCircle size={16} />}
            color={GREEN}
            delay={0}
          />
          <StatCard
            label="Expected Debits (Expenses)"
            value={`₹${stats.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            icon={<ArrowDownCircle size={16} />}
            color={RED}
            delay={80}
          />
          <StatCard
            label="Total Entries"
            value={stats.count}
            icon={<RefreshCw size={16} />}
            color={BLUE}
            delay={160}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{
              border: `1px solid ${RED}33`,
              backgroundColor: `${RED}0D`,
              color: RED,
              animation: "popIn 0.25s ease both",
            }}
          >
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Entries Table */}
        <div
          className="rounded-2xl overflow-hidden transition-shadow duration-300"
          style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "rgba(18,22,31,0.6)",
            animation: "fadeUp 0.55s ease both",
            animationDelay: "220ms",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead style={{ backgroundColor: SURFACE }}>
                <tr
                  className="text-left text-xs uppercase font-semibold"
                  style={{ borderBottom: `1px solid ${BORDER}`, color: TEXT_FAINT }}
                >
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Reference No</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse" style={{ borderTop: idx ? `1px solid ${BORDER_SOFT}` : "none" }}>
                      <td className="px-5 py-4"><div className="h-4 rounded w-20" style={{ backgroundColor: BORDER_SOFT }} /></td>
                      <td className="px-5 py-4"><div className="h-4 rounded w-48" style={{ backgroundColor: BORDER_SOFT }} /></td>
                      <td className="px-5 py-4"><div className="h-4 rounded w-16" style={{ backgroundColor: BORDER_SOFT }} /></td>
                      <td className="px-5 py-4"><div className="h-4 rounded w-24" style={{ backgroundColor: BORDER_SOFT }} /></td>
                      <td className="px-5 py-4"><div className="h-4 rounded w-16 ml-auto" style={{ backgroundColor: BORDER_SOFT }} /></td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center" style={{ color: TEXT_FAINT }}>
                      No ledger entries found. Click "Add expected entry" to record one!
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, i) => (
                    <tr
                      key={entry.id}
                      className="transition-colors"
                      style={{ borderTop: i ? `1px solid ${BORDER_SOFT}` : "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#161B26")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-4 text-xs" style={{ color: TEXT_FAINT, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {entry.date}
                      </td>
                      <td className="px-5 py-4" style={{ color: "#E4E6EB" }}>
                        {entry.description}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: BORDER_SOFT, color: TEXT_DIM }}
                        >
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: TEXT_FAINT, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {entry.referenceNo || "—"}
                      </td>
                      <td
                        className="px-5 py-4 text-right text-xs font-bold"
                        style={{
                          color: entry.type === "credit" ? GREEN : RED,
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {entry.type === "credit" ? "+" : "-"} ₹{entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer accent, consistent with Dashboard / Analytics / Export */}
        <div
          className="flex items-center justify-center gap-2 pt-2 pb-1 text-[11px]"
          style={{ color: TEXT_FAINT, animation: "fadeUp 0.55s ease both", animationDelay: "300ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN, animation: "livePulse 2s infinite" }} />
          Ledger book · synced with your statements
        </div>

      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl"
            style={{
              backgroundColor: SURFACE,
              borderColor: BORDER,
              animation: "popIn 0.2s ease both",
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="text-lg font-semibold flex items-center gap-1.5" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
                <BookOpen size={18} style={{ color: GOLD_SOFT }} /> Add expected entry
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                  style={{ color: TEXT_DIM }}
                >
                  <Calendar size={12} /> Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                  style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                  style={{ color: TEXT_DIM }}
                >
                  <BookOpen size={12} /> Description *
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Rent, Salary deposit, Electric bill"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                  style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                    style={{ color: TEXT_DIM }}
                  >
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
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                    style={{ color: TEXT_DIM }}
                  >
                    Type *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                    style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  >
                    <option value="debit">Debit (-) </option>
                    <option value="credit">Credit (+)</option>
                  </select>
                </div>
              </div>

              {/* Category & Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                    style={{ color: TEXT_DIM }}
                  >
                    <Tag size={12} /> Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                    style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1"
                    style={{ color: TEXT_DIM }}
                  >
                    <Hash size={12} /> Reference No
                  </label>
                  <input
                    type="text"
                    name="referenceNo"
                    placeholder="e.g. UPI Ref, Check#"
                    value={form.referenceNo}
                    onChange={handleInputChange}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = GOLD)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: TEXT_FAINT }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = TEXT; e.currentTarget.style.backgroundColor = BORDER_SOFT; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_FAINT; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GOLD, color: INK }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = GOLD_SOFT; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = GOLD; }}
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