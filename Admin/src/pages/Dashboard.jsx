/**
 * Dashboard.jsx
 * Summary cards + recent transactions + quick upload
 *
 * Visual language: "digital passbook" — a heritage-bank feel (serif display,
 * antique gold accent, ledger typography) laid over a modern dark surface.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listTransactions as listTransactionsFn, listStatements as listStatementsFn } from "../services/api";
import {
  TrendingUp, TrendingDown, Upload,
  ArrowUpCircle, ArrowDownCircle, RefreshCw,
  Landmark, ShieldCheck, Sparkles,
} from "lucide-react";

// Free-to-use bank exterior photograph (Unsplash License — no attribution required)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1569979230536-b3415317a681?fm=jpg&q=80&w=1600&auto=format&fit=crop";

function formatINR(n) {
  if (!n) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/* Decorative "passbook stub" divider — a perforated ledger edge */
function PassbookDivider() {
  return (
    <div className="flex items-center gap-1.5 px-1 select-none" aria-hidden="true">
      {Array.from({ length: 38 }).map((_, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full shrink-0"
          style={{ backgroundColor: "#2A2F3B" }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, accent, sub, delay }) {
  return (
    <div
      className="group relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden
                 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "#12161F",
        border: "1px solid #1F2530",
        animation: `fadeUp 0.55s ease both`,
        animationDelay: `${delay}ms`,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 12px 28px -14px ${accent}55`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)")}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] opacity-80"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "#7A8296", fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `${accent}1A` }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-bold tabular-nums"
          style={{ color: "#F3F4F7", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: "#5F6678" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");

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
    <div
      className="min-h-screen p-6 md:p-10"
      style={{ backgroundColor: "#0A0E17", color: "#EDEFF3" }}
    >
      {/* Fonts + keyframes, scoped to this view */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .hero-cta { position: relative; overflow: hidden; }
        .hero-cta::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 100%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shimmer 3.2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero banner */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ border: "1px solid #1F2530", animation: "fadeUp 0.5s ease both" }}
        >
          <div className="absolute inset-0">
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-40"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, #0A0E17 30%, rgba(10,14,23,0.85) 60%, rgba(10,14,23,0.55) 100%)",
              }}
            />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5 px-6 py-7 md:px-8 md:py-9">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "#C9A2271A",
                  border: "1px solid #C9A22740",
                  animation: "floatSlow 4s ease-in-out infinite",
                }}
              >
                <Landmark size={22} style={{ color: "#D9B65A" }} />
              </div>
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1"
                  style={{ color: "#D9B65A" }}
                >
                  {greeting}
                </p>
                <h1
                  className="text-[26px] md:text-[30px] leading-tight font-semibold"
                  style={{ fontFamily: "'Fraunces', serif", color: "#F6F7F9" }}
                >
                  Your financial overview
                </h1>
                <p className="text-sm mt-1.5" style={{ color: "#9AA1B2" }}>
                  Every statement, every rupee, in one ledger.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/upload")}
              className="hero-cta flex items-center gap-2 px-5 py-3 rounded-xl
                         text-sm font-semibold transition-transform duration-200
                         hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              style={{ backgroundColor: "#C9A227", color: "#0A0E17" }}
            >
              <Upload size={16} /> Upload Statement
            </button>
          </div>

          <PassbookDivider />
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 h-28 animate-pulse"
                style={{ backgroundColor: "#12161F", border: "1px solid #1F2530" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Transactions"
              value={stats?.totalTx || 0}
              icon={<RefreshCw size={16} style={{ color: "#60A5FA" }} />}
              accent="#60A5FA"
              sub={`across ${stats?.statements ?? 0} statements`}
              delay={0}
            />
            <StatCard
              label="Total Credit"
              value={formatINR(stats?.totalCredit)}
              icon={<TrendingUp size={16} style={{ color: "#34D399" }} />}
              accent="#34D399"
              sub="money in"
              delay={80}
            />
            <StatCard
              label="Total Debit"
              value={formatINR(stats?.totalDebit)}
              icon={<TrendingDown size={16} style={{ color: "#F87171" }} />}
              accent="#F87171"
              sub="money out"
              delay={160}
            />
            <StatCard
              label="Net Balance"
              value={formatINR(stats?.net)}
              icon={
                stats?.net >= 0
                  ? <TrendingUp size={16} style={{ color: "#D9B65A" }} />
                  : <TrendingDown size={16} style={{ color: "#F87171" }} />
              }
              accent={stats?.net >= 0 ? "#D9B65A" : "#F87171"}
              sub="credit − debit"
              delay={240}
            />
          </div>
        )}

        {/* Recent transactions */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#12161F",
            border: "1px solid #1F2530",
            animation: "fadeUp 0.6s ease both",
            animationDelay: "200ms",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #1F2530" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: "#D9B65A" }} />
              <h2 className="text-sm font-semibold" style={{ color: "#E4E6EB" }}>
                Recent Transactions
              </h2>
            </div>
            <button
              onClick={() => navigate("/transactions")}
              className="text-xs font-medium transition-colors"
              style={{ color: "#D9B65A" }}
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
                  style={{ borderBottom: "1px solid #1B202B" }}
                >
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "#1B202B" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 rounded w-48" style={{ backgroundColor: "#1B202B" }} />
                    <div className="h-2.5 rounded w-24" style={{ backgroundColor: "#1B202B" }} />
                  </div>
                  <div className="h-3 rounded w-20" style={{ backgroundColor: "#1B202B" }} />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <Landmark size={28} style={{ color: "#3A4152", margin: "0 auto 10px" }} />
              <p className="text-sm" style={{ color: "#7A8296" }}>No transactions yet.</p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-2 text-sm font-medium transition-colors"
                style={{ color: "#D9B65A" }}
              >
                Upload a statement to get started →
              </button>
            </div>
          ) : (
            <div>
              {recent.map((t, i) => (
                <div
                  key={t.transactionId || i}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-200"
                  style={{
                    borderBottom: i === recent.length - 1 ? "none" : "1px solid #1B202B",
                    animation: "fadeUp 0.45s ease both",
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#161B26")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: t.type === "credit" ? "#34D3991A" : "#F871711A",
                    }}
                  >
                    {t.type === "credit"
                      ? <ArrowUpCircle   size={16} style={{ color: "#34D399" }} />
                      : <ArrowDownCircle size={16} style={{ color: "#F87171" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "#E4E6EB" }}>{t.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5F6678" }}>
                      {t.date} · {t.category || "Other"}
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold shrink-0 tabular-nums"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: t.type === "credit" ? "#34D399" : "#F87171",
                    }}
                  >
                    {t.type === "credit" ? "+" : "-"}
                    ₹{(t.credit || t.debit).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 rounded-2xl"
          style={{
            backgroundColor: "#0D111A",
            border: "1px solid #1B202B",
            animation: "fadeUp 0.6s ease both",
            animationDelay: "320ms",
          }}
        >
          <div className="flex items-center gap-2">
            <Landmark size={14} style={{ color: "#D9B65A" }} />
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ fontFamily: "'Fraunces', serif", color: "#B9BECB" }}
            >
              Ledger
            </span>
            <span className="text-xs" style={{ color: "#4B5164" }}>
              · statement intelligence
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs" style={{ color: "#5F6678" }}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} style={{ color: "#34D399" }} />
              Bank-grade encryption
            </span>
            <span>© {new Date().getFullYear()} Ledger</span>
          </div>
        </footer>

      </div>
    </div>
  );
}