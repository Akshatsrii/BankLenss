import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SPENDING_DATA = [
  { month: "Jan", income: 4200, expense: 3100 },
  { month: "Feb", income: 3800, expense: 2900 },
  { month: "Mar", income: 5100, expense: 3800 },
  { month: "Apr", income: 4600, expense: 4100 },
  { month: "May", income: 5500, expense: 3500 },
  { month: "Jun", income: 4900, expense: 4400 },
];

const CATEGORIES = [
  { label: "Food & Dining", amount: 1240, pct: 34, color: "#3b82f6" },
  { label: "Transport", amount: 680, pct: 19, color: "#6366f1" },
  { label: "Shopping", amount: 920, pct: 25, color: "#8b5cf6" },
  { label: "Utilities", amount: 440, pct: 12, color: "#06b6d4" },
  { label: "Other", amount: 360, pct: 10, color: "#475569" },
];

const STATS = [
  { label: "Total Income", value: "₹28,100", change: "+12.4%", up: true },
  { label: "Total Expenses", value: "₹21,800", change: "-3.1%", up: false },
  { label: "Net Savings", value: "₹6,300", change: "+28.7%", up: true },
  { label: "Avg / Month", value: "₹3,633", change: "+5.2%", up: true },
];

const maxVal = Math.max(...SPENDING_DATA.flatMap((d) => [d.income, d.expense]));

export default function Analytics() {
  const [hover, setHover] = useState(null);

  return (
    <div
      className="min-h-screen bg-[#080a12] text-slate-300 px-6 py-8"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1">Dashboard</p>
        <h1
          className="text-2xl font-bold text-slate-100"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Analytics
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-[11px] text-slate-600 mb-2">{s.label}</p>
            <p className="text-xl font-semibold text-slate-100">{s.value}</p>
            <p
              className={`text-[11px] mt-1 ${
                s.up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {s.change} vs last period
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="md:col-span-2 bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">
                Cash Flow
              </p>
              <p className="text-sm font-medium text-slate-200">Income vs Expenses</p>
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

          <div className="flex items-end gap-3 h-44">
            {SPENDING_DATA.map((d, i) => (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className="w-full flex items-end gap-0.5 h-36">
                  {/* Income bar */}
                  <div className="flex-1 rounded-t-sm transition-all duration-300 relative group"
                    style={{
                      height: `${(d.income / maxVal) * 100}%`,
                      background: hover === i ? "#60a5fa" : "#3b82f6",
                    }}
                  >
                    {hover === i && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                        ₹{d.income.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {/* Expense bar */}
                  <div
                    className="flex-1 rounded-t-sm transition-all duration-300"
                    style={{
                      height: `${(d.expense / maxVal) * 100}%`,
                      background: hover === i ? "#818cf8" : "#6366f1",
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-600">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-0.5">
            Breakdown
          </p>
          <p className="text-sm font-medium text-slate-200 mb-5">By Category</p>

          <div className="space-y-3">
            {CATEGORIES.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">{c.label}</span>
                  <span className="text-slate-300">₹{c.amount.toLocaleString()}</span>
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

          {/* Mini legend */}
          <div className="mt-6 pt-4 border-t border-white/[0.05]">
            <p className="text-[10px] text-slate-600 mb-2">Top spend</p>
            <p className="text-lg font-semibold text-slate-100">Food & Dining</p>
            <p className="text-[11px] text-slate-500">34% of total expenses</p>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="mt-4 bg-[#0f111a] border border-white/[0.06] rounded-xl p-5">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-4">
          Insights
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: "📈",
              title: "Savings up 28%",
              desc: "Your savings rate improved significantly compared to last quarter.",
            },
            {
              icon: "⚠️",
              title: "Food spend high",
              desc: "Dining expenses are 12% above your monthly average. Consider meal planning.",
            },
            {
              icon: "✅",
              title: "Bills on track",
              desc: "All utility payments detected and categorised correctly this month.",
            },
          ].map((ins) => (
            <div
              key={ins.title}
              className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <span className="text-lg mt-0.5">{ins.icon}</span>
              <div>
                <p className="text-[12px] font-medium text-slate-200 mb-0.5">
                  {ins.title}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{ins.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}