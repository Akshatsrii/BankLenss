import { useState, useMemo } from "react";

const RAW_DATA = [
  { id: 1,  date: "2024-06-01", desc: "Swiggy Order #9182",         category: "Food",      type: "debit",  amount: 342,   bank: "HDFC" },
  { id: 2,  date: "2024-06-01", desc: "Salary Credit — June",       category: "Income",    type: "credit", amount: 52000, bank: "HDFC" },
  { id: 3,  date: "2024-06-02", desc: "Jio Fiber Bill",             category: "Utilities", type: "debit",  amount: 999,   bank: "HDFC" },
  { id: 4,  date: "2024-06-03", desc: "Amazon Purchase",            category: "Shopping",  type: "debit",  amount: 1840,  bank: "SBI"  },
  { id: 5,  date: "2024-06-04", desc: "Uber Ride",                  category: "Transport", type: "debit",  amount: 184,   bank: "HDFC" },
  { id: 6,  date: "2024-06-05", desc: "Zepto Grocery",              category: "Food",      type: "debit",  amount: 620,   bank: "SBI"  },
  { id: 7,  date: "2024-06-06", desc: "Freelance Payment",          category: "Income",    type: "credit", amount: 8500,  bank: "HDFC" },
  { id: 8,  date: "2024-06-07", desc: "Netflix Subscription",       category: "Shopping",  type: "debit",  amount: 649,   bank: "SBI"  },
  { id: 9,  date: "2024-06-08", desc: "BESCOM Electricity Bill",    category: "Utilities", type: "debit",  amount: 1230,  bank: "HDFC" },
  { id: 10, date: "2024-06-09", desc: "Zomato Order",               category: "Food",      type: "debit",  amount: 275,   bank: "SBI"  },
  { id: 11, date: "2024-06-10", desc: "Metro Card Recharge",        category: "Transport", type: "debit",  amount: 500,   bank: "HDFC" },
  { id: 12, date: "2024-06-11", desc: "Dividend Credit — INFY",     category: "Income",    type: "credit", amount: 1200,  bank: "SBI"  },
  { id: 13, date: "2024-06-12", desc: "Myntra Return Refund",       category: "Shopping",  type: "credit", amount: 799,   bank: "HDFC" },
  { id: 14, date: "2024-06-13", desc: "LIC Premium",                category: "Utilities", type: "debit",  amount: 4200,  bank: "SBI"  },
  { id: 15, date: "2024-06-14", desc: "Big Bazaar",                 category: "Food",      type: "debit",  amount: 1890,  bank: "HDFC" },
  { id: 16, date: "2024-06-15", desc: "Rapido Auto",                category: "Transport", type: "debit",  amount: 65,    bank: "SBI"  },
  { id: 17, date: "2024-06-16", desc: "Steam Game Purchase",        category: "Shopping",  type: "debit",  amount: 1499,  bank: "HDFC" },
  { id: 18, date: "2024-06-17", desc: "Interest Credit",            category: "Income",    type: "credit", amount: 430,   bank: "SBI"  },
  { id: 19, date: "2024-06-18", desc: "Dominos Pizza",              category: "Food",      type: "debit",  amount: 489,   bank: "HDFC" },
  { id: 20, date: "2024-06-19", desc: "BMTC Bus Pass",              category: "Transport", type: "debit",  amount: 300,   bank: "SBI"  },
  { id: 21, date: "2024-06-20", desc: "Spotify Premium",            category: "Shopping",  type: "debit",  amount: 119,   bank: "HDFC" },
  { id: 22, date: "2024-06-21", desc: "Water Bill",                 category: "Utilities", type: "debit",  amount: 220,   bank: "SBI"  },
  { id: 23, date: "2024-06-22", desc: "Blinkit Order",              category: "Food",      type: "debit",  amount: 540,   bank: "HDFC" },
  { id: 24, date: "2024-06-23", desc: "Ola Cab",                    category: "Transport", type: "debit",  amount: 220,   bank: "SBI"  },
  { id: 25, date: "2024-06-24", desc: "Bonus Credit — Q1",         category: "Income",    type: "credit", amount: 15000, bank: "HDFC" },
];

const CATEGORIES = ["All", "Food", "Income", "Utilities", "Shopping", "Transport"];
const TYPES      = ["All", "credit", "debit"];
const PAGE_SIZE  = 10;

const CAT_COLORS = {
  Food:      { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400"   },
  Income:    { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Utilities: { bg: "bg-cyan-500/10",    text: "text-cyan-400",    dot: "bg-cyan-400"    },
  Shopping:  { bg: "bg-violet-500/10",  text: "text-violet-400",  dot: "bg-violet-400"  },
  Transport: { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400"    },
};

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;
  return (
    <span className="ml-1 inline-flex flex-col gap-[2px]">
      <span className={`block w-1.5 h-1 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent ${active && sortDir === "asc" ? "border-b-blue-400" : "border-b-slate-600"}`} />
      <span className={`block w-1.5 h-1 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent ${active && sortDir === "desc" ? "border-t-blue-400" : "border-t-slate-600"}`} />
    </span>
  );
}

export default function Transactions() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [type,     setType]     = useState("All");
  const [sortCol,  setSortCol]  = useState("date");
  const [sortDir,  setSortDir]  = useState("desc");
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState(new Set());

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let d = [...RAW_DATA];
    if (search)          d = d.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") d = d.filter((t) => t.category === category);
    if (type !== "All")     d = d.filter((t) => t.type === type);
    d.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === "string") av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return d;
  }, [search, category, type, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCredit = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit  = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const allSelected = paged.length > 0 && paged.every((t) => selected.has(t.id));
  const toggleAll   = () => {
    const next = new Set(selected);
    if (allSelected) paged.forEach((t) => next.delete(t.id));
    else             paged.forEach((t) => next.add(t.id));
    setSelected(next);
  };
  const toggleRow = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const resetFilters = () => { setSearch(""); setCategory("All"); setType("All"); setPage(1); };

  return (
    <div className="min-h-screen bg-[#080a12] text-slate-300 px-6 py-8"
      style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1">Ledger</p>
          <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
            Transactions
          </h1>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
            <p className="text-slate-600 mb-0.5">Total In</p>
            <p className="text-emerald-400 font-semibold">₹{totalCredit.toLocaleString()}</p>
          </div>
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
            <p className="text-slate-600 mb-0.5">Total Out</p>
            <p className="text-red-400 font-semibold">₹{totalDebit.toLocaleString()}</p>
          </div>
          <div className="bg-[#0f111a] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
            <p className="text-slate-600 mb-0.5">Rows</p>
            <p className="text-slate-200 font-semibold">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search transactions…"
            className="w-full bg-[#0f111a] border border-white/[0.06] rounded-lg pl-8 pr-3 py-2 text-[12px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-[11px] border transition-all duration-150 ${
                category === c
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/10"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Type toggle */}
        <div className="flex items-center bg-[#0f111a] border border-white/[0.06] rounded-lg overflow-hidden text-[11px]">
          {TYPES.map((t) => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-2 capitalize transition-colors ${
                type === t ? "bg-blue-500/10 text-blue-300" : "text-slate-500 hover:text-slate-300"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Reset */}
        {(search || category !== "All" || type !== "All") && (
          <button onClick={resetFilters}
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors px-2">
            ✕ Reset
          </button>
        )}

        {/* Bulk action */}
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2 text-[11px] bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
            <span className="text-blue-300">{selected.size} selected</span>
            <button onClick={() => setSelected(new Set())} className="text-slate-500 hover:text-slate-300">✕</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0f111a] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="w-10 px-4 py-3">
                <div onClick={toggleAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                    allSelected ? "border-blue-500 bg-blue-500" : "border-white/20 hover:border-white/40"
                  }`}>
                  {allSelected && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              </th>
              {[["date","Date"],["desc","Description"],["category","Category"],["type","Type"],["amount","Amount"],["bank","Bank"]].map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)}
                  className="px-4 py-3 text-left text-[10px] text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-400 transition-colors select-none">
                  <span className="flex items-center gap-0.5">
                    {label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir}/>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-slate-600">No transactions match your filters.</td></tr>
            ) : paged.map((t, i) => {
              const cat = CAT_COLORS[t.category] || {};
              const isSelected = selected.has(t.id);
              return (
                <tr key={t.id} onClick={() => toggleRow(t.id)}
                  className={`border-b border-white/[0.03] transition-colors cursor-pointer ${
                    isSelected ? "bg-blue-500/5" : i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                  } hover:bg-white/[0.03]`}>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-white/20"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{t.desc}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${cat.bg} ${cat.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`}/>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                      t.type === "credit"
                        ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                        : "text-red-400 border-red-500/20 bg-red-500/5"
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold tabular-nums whitespace-nowrap ${
                    t.type === "credit" ? "text-emerald-400" : "text-slate-200"
                  }`}>
                    {t.type === "credit" ? "+" : "−"}₹{t.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t.bank}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
          <p className="text-[11px] text-slate-600">
            Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1}
              className="px-2.5 py-1.5 rounded-md border border-white/[0.06] text-[11px] text-slate-500 hover:text-slate-300 hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-md text-[11px] transition-all ${
                  page === p
                    ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                    : "text-slate-600 hover:text-slate-300"
                }`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-md border border-white/[0.06] text-[11px] text-slate-500 hover:text-slate-300 hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}