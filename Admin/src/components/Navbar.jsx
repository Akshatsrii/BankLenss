import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { Sun, Moon } from "lucide-react";

const INK        = "#0A0E17";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";
const RED        = "#F87171";

const NAV_LINKS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
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
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: "/statements",
    label: "Statements",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
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
    to: "/ledger",
    label: "Ledger Book",
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const { pathname }      = useLocation();
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const { isDark, toggle } = useTheme();

  const [time, setTime]         = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const linkStyle = (to) => ({
    color: pathname === to ? TEXT : TEXT_DIM,
    backgroundColor: pathname === to ? `${GOLD}14` : "transparent",
  });

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AK";

  return (
    <nav
      className="px-6 h-14 flex items-center gap-0 relative"
      style={{ backgroundColor: INK, borderBottom: `1px solid ${BORDER_SOFT}`, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 mr-8 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_SOFT} 100%)` }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" style={{ fill: INK }}>
            <path d="M2 4h12v1.5H2zM3 7h10v1H3zM4 10h8v1H4z" />
            <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke={INK} strokeWidth="1.2" />
          </svg>
        </div>
        <span className="text-[15px] font-extrabold tracking-wide" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
          Bank<span style={{ color: GOLD_SOFT }}>Lens</span>
        </span>
      </div>

      {/* Desktop links */}
      {user && (
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ to, label, icon, badge }) => (
            <Link
              key={to}
              to={to}
              className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 select-none"
              style={linkStyle(to)}
              onMouseEnter={(e) => {
                if (pathname !== to) {
                  e.currentTarget.style.color = TEXT;
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== to) {
                  e.currentTarget.style.color = TEXT_DIM;
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {icon}{label}
              {pathname === to && (
                <span
                  className="absolute -bottom-[17px] left-3 right-3 h-0.5 rounded-t"
                  style={{ backgroundColor: GOLD }}
                />
              )}
              {badge && (
                <span
                  className="ml-0.5 text-[10px] px-1.5 py-px rounded-full font-semibold"
                  style={{ backgroundColor: GOLD, color: INK }}
                >
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
          style={{ border: `1px solid ${BORDER_SOFT}`, backgroundColor: "rgba(255,255,255,0.02)", color: TEXT_FAINT }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {user && <div className="hidden md:block w-px h-5" style={{ backgroundColor: BORDER_SOFT }} />}

        {/* OCR status */}
        {user && (
          <div
            className="hidden md:flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1"
            style={{ color: TEXT_FAINT, border: `1px solid ${BORDER_SOFT}` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: GREEN, boxShadow: `0 0 0 3px ${GREEN}26` }}
            />
            OCR Ready
          </div>
        )}

        {/* Clock */}
        {user && (
          <span className="hidden md:block text-[11px] tabular-nums w-[70px] text-right" style={{ color: TEXT_FAINT }}>
            {time}
          </span>
        )}

        {user && <div className="hidden md:block w-px h-5" style={{ backgroundColor: BORDER_SOFT }} />}

        {/* Avatar + email + sign out */}
        {user && (
          <div className="flex items-center gap-2.5">
            <span className="hidden lg:block text-[11px] truncate max-w-[140px]" style={{ color: TEXT_FAINT }}>
              {user.email}
            </span>

            {/* Avatar — click goes to profile */}
            <button
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold select-none transition-all duration-150"
              style={{
                background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}14)`,
                color: GOLD_SOFT,
                border: `1px solid ${GOLD}4D`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${GOLD}33`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              title="Profile"
            >
              {initials}
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150"
              style={{ border: `1px solid ${BORDER_SOFT}`, backgroundColor: "rgba(255,255,255,0.02)", color: TEXT_FAINT }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${RED}4D`;
                e.currentTarget.style.color = RED;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER_SOFT;
                e.currentTarget.style.color = TEXT_FAINT;
              }}
              title="Sign out"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign Out
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {user && (
          <button
            className="md:hidden transition-colors duration-150"
            style={{ color: TEXT_DIM }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
              }
            </svg>
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {user && menuOpen && (
        <div
          className="md:hidden absolute top-14 left-0 right-0 z-50 px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: INK, borderBottom: `1px solid ${BORDER_SOFT}` }}
        >
          {NAV_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to} to={to}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm"
              style={{
                backgroundColor: pathname === to ? `${GOLD}14` : "transparent",
                color: pathname === to ? TEXT : TEXT_DIM,
              }}
              onClick={() => setMenuOpen(false)}
            >
              {icon}{label}
            </Link>
          ))}
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm"
            style={{ color: TEXT_DIM }}
            onClick={() => setMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
            Profile
          </Link>
          <button
            onClick={() => { setMenuOpen(false); handleSignOut(); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors duration-150"
            style={{ color: RED }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${RED}1A`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
          <div className="mt-2 pt-2 flex items-center justify-between text-xs" style={{ borderTop: `1px solid ${BORDER_SOFT}`, color: TEXT_FAINT }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} /> OCR Ready
            </span>
            <span className="tabular-nums">{time}</span>
          </div>
        </div>
      )}
    </nav>
  );
}