/**
 * Dashboard.jsx
 * Summary cards + recent transactions + quick upload
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import {
  TrendingUp, TrendingDown, Upload,
  ArrowUpCircle, ArrowDownCircle, RefreshCw,
} from "lucide-react";

const listTransactionsFn = httpsCallable(functions, "listTransactions");
const listStatementsFn   = httpsCallable(functions, "listStatements");

function formatINR(n) {
  if (!n) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [txRes, stRes] = await Promise.all([
          listTransactionsFn({ page: 1, pageSize: 100 }),
          listStatementsFn(),
        ]);

        const txns       = txRes.data.data || [];
        const statements = stRes.data.data || [];

        const totalDebit  = txns.reduce((s, t) => s + t.debit,  0);
        const totalCredit = txns.reduce((s, t) => s + t.credit, 0);

        setStats({
          totalTx:     txRes.data.total || txns.length,
          totalDebit,
          totalCredit,
          net:         totalCredit - totalDebit,
          statements:  statements.length,
        });

        setRecent(txns.slice(0, 6));
      } catch (err) {
        console.error("[Dashboard]", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Your financial overview at a glance.</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-blue-600 hover:bg-blue-500 text-white text-sm
                       font-medium transition-colors"
          >
            <Upload size={15} /> Upload Statement
          </button>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Transactions"
              value={stats?.totalTx || 0}
              icon={<RefreshCw size={16} className="text-blue-400" />}
              color="bg-blue-500/10"
              sub={`across ${stats?.statements} statements`}
            />
            <StatCard
              label="Total Credit"
              value={formatINR(stats?.totalCredit)}
              icon={<TrendingUp size={16} className="text-green-400" />}
              color="bg-green-500/10"
              sub="money in"
            />
            <StatCard
              label="Total Debit"
              value={formatINR(stats?.totalDebit)}
              icon={<TrendingDown size={16} className="text-red-400" />}
              color="bg-red-500/10"
              sub="money out"
            />
            <StatCard
              label="Net Balance"
              value={formatINR(stats?.net)}
              icon={stats?.net >= 0
                ? <TrendingUp size={16} className="text-emerald-400" />
                : <TrendingDown size={16} className="text-red-400" />
              }
              color={stats?.net >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
              sub="credit − debit"
            />
          </div>
        )}

        {/* Recent transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">Recent Transactions</h2>
            <button
              onClick={() => navigate("/transactions")}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-800">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-800 rounded w-48" />
                    <div className="h-2.5 bg-slate-800 rounded w-24" />
                  </div>
                  <div className="h-3 bg-slate-800 rounded w-20" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 text-sm">No transactions yet.</p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Upload a statement to get started →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {recent.map((t, i) => (
                <div key={t.transactionId || i}
                     className="flex items-center gap-4 px-5 py-3.5
                                hover:bg-slate-800/40 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    {t.type === "credit"
                      ? <ArrowUpCircle   size={16} className="text-green-400" />
                      : <ArrowDownCircle size={16} className="text-red-400"   />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{t.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.date} · {t.category || "Other"}</p>
                  </div>
                  <span className={`text-sm font-mono font-medium shrink-0 ${
                    t.type === "credit" ? "text-green-400" : "text-red-400"
                  }`}>
                    {t.type === "credit" ? "+" : "-"}
                    ₹{(t.credit || t.debit).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}