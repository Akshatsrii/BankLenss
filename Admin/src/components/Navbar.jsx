import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  {
    to: "/upload",
    label: "Upload",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </svg>
    ),
  },
  {
    to: "/transactions",
    label: "Transactions",
    badge: 248,
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    to: "/export",
    label: "Export",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

 const linkClass = (to) =>
  `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 select-none ${
    pathname === to
      ? "text-slate-100 bg-blue-500/10 after:absolute after:-bottom-[17px] after:left-3 after:right-3 after:h-0.5 after:bg-blue-500 after:rounded-t"
      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
  }`;

  return (
    <nav
      className="bg-[#0f111a] border-b border-white/[0.07] px-6 h-14 flex items-center gap-0 relative"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-8 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <svg className="w-4 h-4 fill-white" viewBox="0 0 16 16">
            <path d="M2 4h12v1.5H2zM3 7h10v1H3zM4 10h8v1H4z" />
            <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="white" strokeWidth="1.2" />
          </svg>
        </div>
        <span className="text-slate-200 text-[15px] font-bold tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
          Bank<span className="text-blue-400">Digitizer</span>
        </span>
      </div>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-0.5 flex-1">
        {NAV_LINKS.map(({ to, label, icon, badge }) => (
          <Link key={to} to={to} className={linkClass(to)}>
            {icon}
            {label}
            {badge && (
              <span className="ml-0.5 text-[10px] bg-blue-500 text-white px-1.5 py-px rounded-full font-semibold">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Search */}
        <button className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border border-white/[0.07] rounded-md bg-white/[0.02] text-slate-500 text-xs hover:border-blue-500/40 hover:text-slate-300 transition-all duration-150">
          <svg className="w-3 h-3" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search…
          <span className="text-[10px] border border-white/10 rounded px-1 py-px">⌘K</span>
        </button>

        <div className="hidden md:block w-px h-5 bg-white/[0.07]" />

        {/* OCR status */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 border border-white/[0.07] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.15)] animate-pulse" />
          OCR Ready
        </div>

        {/* Clock */}
        <span className="hidden md:block text-[11px] text-slate-600 tabular-nums w-[70px] text-right">
          {time}
        </span>

        <div className="hidden md:block w-px h-5 bg-white/[0.07]" />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] flex items-center justify-center text-[11px] font-semibold text-blue-300 border border-blue-500/30 cursor-pointer select-none">
          AK
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-400 hover:text-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-[#0f111a] border-b border-white/[0.07] z-50 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon, badge }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm ${
                pathname === to ? "bg-blue-500/10 text-slate-100" : "text-slate-400"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {icon}
              {label}
              {badge && (
                <span className="ml-auto text-[10px] bg-blue-500 text-white px-1.5 py-px rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-white/[0.07] flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> OCR Ready
            </span>
            <span className="tabular-nums">{time}</span>
          </div>
        </div>
      )}
    </nav>
  );
}