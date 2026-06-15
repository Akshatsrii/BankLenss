/**
 * Analytics.jsx
 * Real Firebase data + polished UI from design system
 */

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const listTransactionsFn = httpsCallable(functions, "listTransactions");

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CATEGORY_COLORS = {
  Food:       "#3b82f6",
  Salary:     "#22c55e",
  Rent:       "#8b5cf6",
  Utility:    "#06b6d4",
  Shopping:   "#ec4899",
  Transport:  "#6366f1",
  ATM:        "#64748b",
  Investment: "#f59e0b",
  Health:     "#ef4444",
  Transfer:   "#14b8a6",
  Other:      "#475569",
};

function formatINR(n) {
  if (!n || n === 0) return "₹0";
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return "₹" + (n / 100000).toFixed(1)   + "L";
  if (n >= 1000)     return "₹" + (n / 1000).toFixed(1)     + "K";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// ── Custom bar chart (no recharts dependency issues) ──────────
function BarGroup({ data, maxVal, hover, setHover }) {
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-1"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="w-full flex items-end gap-0.5 h-36 relative">
            {/* Income bar */}
            <div
              className="flex-1 rounded-t-sm transition-all duration-300"
              style={{
                height: maxVal ? `${(d.Income / maxVal) * 100}%` : "0%",
                background: hover === i ? "#60a5fa" : "#3b82f6",
              }}
            />
            {/* Expense bar */}
            <div
              className="flex-1 rounded-t-sm transition-all duration-300"
              style={{
                height: maxVal ? `${(d.Expense / maxVal) * 100}%` : "0%",
                background: hover === i ? "#818cf8" : "#6366f1",
              }}
            />
            {/* Hover tooltip */}
            {hover === i && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10
                              bg-slate-800 border border-slate-700 rounded-lg
                              px-2.5 py-1.5 text-[10px] whitespace-nowrap text-center">
                <p className="text-blue-400">↑ {formatINR(d.Income)}</p>
                <p className="text-indigo-400">↓ {formatINR(d.Expense)}</p>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-600">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [txns, setTxns]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover]     = useState(null);

  useEffect(() => {
    listTransactionsFn({ page: 1, pageSize: 1000 })
      .then((r) => setTxns(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ──────────────────────────────────────────
  const totalIncome  = txns.reduce((s, t) => s + (t.credit || 0), 0);
  const totalExpense = txns.reduce((s, t) => s + (t.debit  || 0), 0);
  const netSavings   = totalIncome - totalExpense;
  const avgPerMonth  = (() => {
    const months = new Set(txns.map((t) => t.date?.slice(0, 7)).filter(Boolean));
    return months.size > 0 ? netSavings / months.size : 0;
  })();

  const STATS = [
    { label: "Total Income",   value: formatINR(totalIncome),  up: true  },
    { label: "Total Expenses", value: formatINR(totalExpense), up: false },
    { label: "Net Savings",    value: formatINR(netSavings),   up: netSavings >= 0 },
    { label: "Avg / Month",    value: formatINR(avgPerMonth),  up: avgPerMonth >= 0 },
  ];

  // Category breakdown
  const categoryMap = txns
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + t.debit;
      return acc;
    }, {});

  const totalCatSpend = Object.values(categoryMap).reduce((s, v) => s + v, 0);

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, amount]) => ({
      label,
      amount,
      pct: totalCatSpend ? Math.round((amount / totalCatSpend) * 100) : 0,
      color: CATEGORY_COLORS[label] || "#475569",
    }));

  const topCategory = categories[0];

  // Monthly chart data
  const monthlyMap = txns.reduce((acc, t) => {
    const m = t.date?.slice(0, 7);
    if (!m) return acc;
    if (!acc[m]) acc[m] = { month: m, Income: 0, Expense: 0 };
    if (t.type === "credit") acc[m].Income  += t.credit;
    else                     acc[m].Expense += t.debit;
    return acc;
  }, {});

  const monthlyChart = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => ({
      month:   MONTHS[parseInt(d.month.split("-")[1]) - 1],
      Income:  Math.round(d.Income),
      Expense: Math.round(d.Expense),
    }));

  const maxVal = Math.max(...monthlyChart.flatMap((d) => [d.Income, d.Expense]), 0);

  // Top merchants
  const merchantMap = txns
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => {
      const key = t.description.split("-")[1]?.trim() ||
                  t.description.split(" ").slice(0, 3).join(" ");
      acc[key] = (acc[key] || 0) + t.debit;
      return acc;
    }, {});

  const merchants = Object.entries(merchantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Insights
  const insights = [];
  if (netSavings > 0) {
    insights.push({ icon: "📈", title: "Positive savings", desc: `You saved ${formatINR(netSavings)} overall. Keep it up!` });
  } else {
    insights.push({ icon: "⚠️", title: "Expenses exceed income", desc: `You spent ${formatINR(Math.abs(netSavings))} more than you earned.` });
  }
  if (topCategory) {
    insights.push({ icon: "🏷️", title: `${topCategory.label} is top spend`, desc: `${topCategory.pct}% of total expenses — ${formatINR(topCategory.amount)}.` });
  }
  if (txns.length > 0) {
    insights.push({ icon: "✅", title: `${txns.length} transactions analysed`, desc: "All transactions have been categorised automatically." });
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────
  if (txns.length === 0) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center p-6"
           style={{ fontFamily: "'DM Mono', monospace" }}>
        <div className="text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-slate-300 font-medium">No data yet</p>
          <p className="text-slate-600 text-sm mt-1">Upload a statement to see analytics.</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#080a12] text-slate-300 px-6 py-8"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
            Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Visual breakdown of your spending patterns.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[11px] text-slate-600 mb-2">{s.label}</p>
              <p className="text-xl font-semibold text-slate-100">{s.value}</p>
              <div className={`flex items-center gap-1 text-[11px] mt-1 ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                {s.up
                  ? <TrendingUp  size={11} />
                  : <TrendingDown size={11} />
                }
                <span>{s.up ? "positive" : "negative"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Bar chart + Category breakdown */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Bar chart */}
          <div className="md:col-span-2 bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">Cash Flow</p>
                <p className="text-sm font-medium text-slate-200">Income vs Expenses (last 6 months)</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Expense
                </span>
              </div>
            </div>

            {monthlyChart.length < 1 ? (
              <p className="text-slate-600 text-xs py-12 text-center">
                Not enough monthly data yet.
              </p>
            ) : (
              <BarGroup
                data={monthlyChart}
                maxVal={maxVal}
                hover={hover}
                setHover={setHover}
              />
            )}
          </div>

          {/* Category breakdown */}
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">Breakdown</p>
            <p className="text-sm font-medium text-slate-200 mb-5">By Category</p>

            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-slate-600 text-xs">No debit transactions found.</p>
              ) : categories.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{c.label}</span>
                    <span className="text-slate-300">
                      {formatINR(c.amount)}
                      <span className="text-slate-600 ml-1">({c.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${c.pct}%`, background: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {topCategory && (
              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <p className="text-[10px] text-slate-600 mb-1">Top spend category</p>
                <p className="text-lg font-semibold text-slate-100">{topCategory.label}</p>
                <p className="text-[11px] text-slate-500">{topCategory.pct}% of total expenses</p>
              </div>
            )}
          </div>
        </div>

        {/* Top merchants */}
        {merchants.length > 0 && (
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">Merchants</p>
            <p className="text-sm font-medium text-slate-200 mb-5">Top 5 by Spend</p>
            <div className="space-y-3">
              {merchants.map(([name, amount], i) => {
                const pct = Math.round((amount / merchants[0][1]) * 100);
                return (
                  <div key={name} className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-600 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">{name}</span>
                        <span className="text-xs text-slate-400 font-mono shrink-0 ml-2">
                          {formatINR(amount)}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: CATEGORY_COLORS[categories[i]?.label] || "#3b82f6" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">Insights</p>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((ins) => (
              <div
                key={ins.title}
                className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
              >
                <span className="text-lg mt-0.5">{ins.icon}</span>
                <div>
                  <p className="text-[12px] font-medium text-slate-200 mb-0.5">{ins.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}