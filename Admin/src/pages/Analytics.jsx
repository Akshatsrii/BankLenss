/**
 * Analytics.jsx
 * Real Firebase data + polished "Ledger" design system
 */

import { useState, useEffect } from "react";
import { listTransactions as listTransactionsFn } from "../services/api";
import { TrendingUp, TrendingDown, PieChart, BarChart3, Store, Lightbulb, Landmark } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Palette kept distinct-per-category for legibility, warmed slightly to sit
// next to the gold/ink theme rather than a pure-saturated rainbow.
const CATEGORY_COLORS = {
  Food:       "#60A5FA",
  Salary:     "#34D399",
  Rent:       "#A78BFA",
  Utility:    "#22D3EE",
  Shopping:   "#F472B6",
  Transport:  "#818CF8",
  ATM:        "#8B93A7",
  Investment: "#D9B65A",
  Health:     "#F87171",
  Transfer:   "#2DD4BF",
  Other:      "#5F6678",
};

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

function formatINR(n) {
  if (!n || n === 0) return "₹0";
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return "₹" + (n / 100000).toFixed(1)   + "L";
  if (n >= 1000)     return "₹" + (n / 1000).toFixed(1)     + "K";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ── Custom bar chart (no recharts dependency) ─────────────── */
function BarGroup({ data, maxVal, hover, setHover }) {
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((d, i) => (
        <div
          key={d.month}
          className="flex-1 flex flex-col items-center gap-1 group"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="w-full flex items-end gap-0.5 h-36 relative">
            {/* Income bar */}
            <div
              className="flex-1 rounded-t-sm transition-all duration-300 ease-out"
              style={{
                height: maxVal ? `${(d.Income / maxVal) * 100}%` : "0%",
                background: hover === i
                  ? `linear-gradient(180deg, #6EF0BE, ${GREEN})`
                  : `linear-gradient(180deg, ${GREEN}, ${GREEN}CC)`,
                boxShadow: hover === i ? `0 0 14px ${GREEN}66` : "none",
              }}
            />
            {/* Expense bar */}
            <div
              className="flex-1 rounded-t-sm transition-all duration-300 ease-out"
              style={{
                height: maxVal ? `${(d.Expense / maxVal) * 100}%` : "0%",
                background: hover === i
                  ? `linear-gradient(180deg, #FFA9A9, ${RED})`
                  : `linear-gradient(180deg, ${RED}, ${RED}CC)`,
                boxShadow: hover === i ? `0 0 14px ${RED}66` : "none",
              }}
            />
            {/* Hover tooltip */}
            {hover === i && (
              <div
                className="absolute -top-11 left-1/2 -translate-x-1/2 z-10
                           rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap text-center"
                style={{
                  backgroundColor: "#171C27",
                  border: `1px solid ${BORDER}`,
                  boxShadow: "0 10px 24px -8px rgba(0,0,0,0.6)",
                  animation: "popIn 0.18s ease both",
                }}
              >
                <p style={{ color: GREEN }}>↑ {formatINR(d.Income)}</p>
                <p style={{ color: RED }}>↓ {formatINR(d.Expense)}</p>
              </div>
            )}
          </div>
          <span
            className="text-[10px] transition-colors duration-200"
            style={{ color: hover === i ? GOLD_SOFT : TEXT_FAINT }}
          >
            {d.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ eyebrow, title, icon }) {
  return (
    <div className="flex items-center gap-2 mb-0.5">
      {icon && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${GOLD}14` }}
        >
          {icon}
        </div>
      )}
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: GOLD_SOFT }}
        >
          {eyebrow}
        </p>
        {title && <p className="text-sm font-medium mt-0.5" style={{ color: "#E4E6EB" }}>{title}</p>}
      </div>
    </div>
  );
}

/* Decorative "passbook stub" divider — a perforated ledger edge */
function PassbookDivider() {
  return (
    <div className="flex items-center gap-1.5 px-1 select-none" aria-hidden="true">
      {Array.from({ length: 46 }).map((_, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full shrink-0"
          style={{ backgroundColor: "#232838" }}
        />
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
    { label: "Total Income",   value: formatINR(totalIncome),  up: true,               accent: GREEN },
    { label: "Total Expenses", value: formatINR(totalExpense), up: false,              accent: RED   },
    { label: "Net Savings",    value: formatINR(netSavings),   up: netSavings >= 0,    accent: netSavings >= 0 ? GOLD_SOFT : RED },
    { label: "Avg / Month",    value: formatINR(avgPerMonth),  up: avgPerMonth >= 0,   accent: BLUE  },
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

  const fontStack = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes popIn    { from { opacity: 0; transform: translate(-50%, 4px) scale(0.92); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
    @keyframes floatSlow{ 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
    @keyframes glowPulse{ 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
    @keyframes livePulse{
      0%   { box-shadow: 0 0 0 0 ${GREEN}66; }
      70%  { box-shadow: 0 0 0 6px ${GREEN}00; }
      100% { box-shadow: 0 0 0 0 ${GREEN}00; }
    }
  `;

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: INK }}>
        <style>{fontStack}</style>
        <div
          className="absolute w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${GOLD}22, transparent 70%)`, filter: "blur(10px)" }}
        />
        <div
          className="w-7 h-7 rounded-full border-2 animate-spin relative"
          style={{ borderColor: BORDER, borderTopColor: GOLD }}
        />
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────
  if (txns.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
        style={{ backgroundColor: INK, fontFamily: "'Inter', sans-serif" }}
      >
        <style>{fontStack}</style>
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${GOLD}18, transparent 70%)` }}
        />
        <div className="text-center relative" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4s ease-in-out infinite",
            }}
          >
            <PieChart size={24} style={{ color: GOLD_SOFT }} />
          </div>
          <p className="font-medium" style={{ color: TEXT, fontFamily: "'Fraunces', serif", fontSize: "18px" }}>
            No data yet
          </p>
          <p className="text-sm mt-1" style={{ color: TEXT_FAINT }}>Upload a statement to see analytics.</p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-6 py-8 relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{fontStack}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute top-1/2 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BLUE}0D, transparent 70%)` }}
      />

      <div className="max-w-6xl mx-auto space-y-6 relative">

        {/* Header */}
        <div className="flex items-center gap-3" style={{ animation: "fadeUp 0.45s ease both" }}>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4.5s ease-in-out infinite",
            }}
          >
            <BarChart3 size={19} style={{ color: GOLD_SOFT }} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>Overview</p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
              Analytics
            </h1>
          </div>
        </div>
        <p className="text-sm -mt-4" style={{ color: TEXT_FAINT, animation: "fadeUp 0.5s ease both", animationDelay: "40ms" }}>
          Visual breakdown of your spending patterns.
        </p>

        <PassbookDivider />

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="relative rounded-xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: SURFACE,
                border: `1px solid ${BORDER}`,
                animation: "fadeUp 0.5s ease both",
                animationDelay: `${i * 70}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 14px 30px -16px ${s.accent}70`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <span
                className="absolute left-0 top-0 h-full w-[3px]"
                style={{ backgroundColor: s.accent, opacity: 0.85, animation: "glowPulse 2.6s ease-in-out infinite" }}
              />
              <span
                className="absolute -right-6 -top-6 w-16 h-16 rounded-full"
                style={{ background: `radial-gradient(circle, ${s.accent}22, transparent 70%)` }}
              />
              <p className="text-[11px] mb-2 relative" style={{ color: TEXT_FAINT }}>{s.label}</p>
              <p
                className="text-xl font-semibold tabular-nums relative"
                style={{ color: TEXT, fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {s.value}
              </p>
              <div
                className="flex items-center gap-1 text-[11px] mt-1 relative"
                style={{ color: s.up ? GREEN : RED }}
              >
                {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{s.up ? "positive" : "negative"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Bar chart + Category breakdown */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Bar chart */}
          <div
            className="md:col-span-2 rounded-xl p-5 transition-shadow duration-300"
            style={{
              backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
              animation: "fadeUp 0.55s ease both", animationDelay: "140ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div className="flex items-center justify-between mb-6">
              <SectionLabel eyebrow="Cash Flow" title="Income vs Expenses (last 6 months)" />
              <div className="flex items-center gap-4 text-[11px]" style={{ color: TEXT_FAINT }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN, boxShadow: `0 0 6px ${GREEN}88` }} /> Income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RED, boxShadow: `0 0 6px ${RED}88` }} /> Expense
                </span>
              </div>
            </div>

            {monthlyChart.length < 1 ? (
              <p className="text-xs py-12 text-center" style={{ color: TEXT_FAINT }}>
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
          <div
            className="rounded-xl p-5 transition-shadow duration-300"
            style={{
              backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
              animation: "fadeUp 0.55s ease both", animationDelay: "210ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <SectionLabel eyebrow="Breakdown" title="By Category" />
            <div className="space-y-3 mt-5">
              {categories.length === 0 ? (
                <p className="text-xs" style={{ color: TEXT_FAINT }}>No debit transactions found.</p>
              ) : categories.map((c, i) => (
                <div
                  key={c.label}
                  style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${260 + i * 50}ms` }}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="flex items-center gap-1.5" style={{ color: TEXT_DIM }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                    <span style={{ color: "#C7CBD6" }}>
                      {formatINR(c.amount)}
                      <span style={{ color: TEXT_FAINT }} className="ml-1">({c.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BORDER_SOFT }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${c.pct}%`, background: `linear-gradient(90deg, ${c.color}CC, ${c.color})` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {topCategory && (
              <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${BORDER_SOFT}` }}>
                <p className="text-[10px] mb-1" style={{ color: TEXT_FAINT }}>Top spend category</p>
                <p className="text-lg font-semibold" style={{ color: TEXT, fontFamily: "'Fraunces', serif" }}>
                  {topCategory.label}
                </p>
                <p className="text-[11px]" style={{ color: TEXT_FAINT }}>{topCategory.pct}% of total expenses</p>
              </div>
            )}
          </div>
        </div>

        {/* Top merchants */}
        {merchants.length > 0 && (
          <div
            className="rounded-xl p-5 transition-shadow duration-300"
            style={{
              backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
              animation: "fadeUp 0.55s ease both", animationDelay: "280ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <SectionLabel eyebrow="Merchants" title="Top 5 by Spend" icon={<Store size={14} style={{ color: GOLD_SOFT }} />} />
            <div className="space-y-3 mt-5">
              {merchants.map(([name, amount], i) => {
                const pct = Math.round((amount / merchants[0][1]) * 100);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-4 rounded-lg px-1.5 -mx-1.5 py-1 transition-colors duration-200"
                    style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${320 + i * 50}ms` }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#161B26")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <span
                      className="text-[11px] w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ color: GOLD_SOFT, backgroundColor: `${GOLD}14` }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs truncate max-w-[200px]" style={{ color: TEXT_DIM }}>{name}</span>
                        <span
                          className="text-xs shrink-0 ml-2"
                          style={{ color: TEXT_FAINT, fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {formatINR(amount)}
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: BORDER_SOFT }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%`, background: CATEGORY_COLORS[categories[i]?.label] || BLUE }}
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
        <div
          className="rounded-xl p-5 transition-shadow duration-300"
          style={{
            backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
            animation: "fadeUp 0.55s ease both", animationDelay: "340ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <SectionLabel eyebrow="Insights" icon={<Lightbulb size={14} style={{ color: GOLD_SOFT }} />} />
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {insights.map((ins, i) => (
              <div
                key={ins.title}
                className="flex gap-3 p-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "#0D111A",
                  border: `1px solid ${BORDER_SOFT}`,
                  animation: "fadeUp 0.4s ease both",
                  animationDelay: `${380 + i * 60}ms`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${GOLD}55`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER_SOFT)}
              >
                <span
                  className="text-lg mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${GOLD}12` }}
                >
                  {ins.icon}
                </span>
                <div>
                  <p className="text-[12px] font-medium mb-0.5" style={{ color: "#E4E6EB" }}>{ins.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: TEXT_FAINT }}>{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PassbookDivider />

        {/* Small footer accent, consistent with Dashboard */}
        <div
          className="flex items-center justify-center gap-2 pt-1 pb-1 text-[11px]"
          style={{ color: TEXT_FAINT, animation: "fadeUp 0.55s ease both", animationDelay: "440ms" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: GREEN, animation: "livePulse 2s infinite" }}
          />
          <Landmark size={12} style={{ color: GOLD_SOFT }} />
          Ledger analytics · updated in real time
        </div>

      </div>
    </div>
  );
}