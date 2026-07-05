import { useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Landmark, ShieldCheck } from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/invalid-credential": "Incorrect email or password.",
};

// Free-to-use bank exterior photograph (Unsplash License — no attribution required)
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1569979230536-b3415317a681?fm=jpg&q=80&w=1600&auto=format&fit=crop";

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";

const inputClass =
  "w-full rounded-xl px-4 py-3.5 outline-none transition-all";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    let validationErr = null;
    if (!email.trim()) validationErr = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) validationErr = "Enter a valid email.";
    else if (!password) validationErr = "Password is required.";
    else if (password.length < 6) validationErr = "Password must be at least 6 characters.";

    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        FIREBASE_ERRORS[err.code] || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const FONT_STACK = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    @keyframes fadeUp    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes kenBurns  { from { transform: scale(1.06); } to { transform: scale(1); } }
  `;

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: INK }}>
        <style>{FONT_STACK}</style>
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: BORDER, borderTopColor: GOLD }}
        />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex font-sans" style={{ backgroundColor: INK }}>
      <style>{FONT_STACK}</style>

      {/* Decorative Left Side — full-cover bank photograph */}
      <div className="hidden lg:flex w-1/2 h-screen flex-col justify-between p-12 relative overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "kenBurns 16s ease-out both" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,14,23,0.55) 0%, rgba(10,14,23,0.72) 55%, rgba(10,14,23,0.94) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${INK} 0%, transparent 30%)` }}
        />

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 relative z-10" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4.5s ease-in-out infinite",
            }}
          >
            <Landmark size={18} style={{ color: GOLD_SOFT }} />
          </div>
          <span className="text-lg font-semibold tracking-wide" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
            Ledger
          </span>
        </div>

        {/* Hero Quote */}
        <div className="space-y-4 relative z-10" style={{ animation: "fadeUp 0.6s ease both", animationDelay: "100ms" }}>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD_SOFT }}>
            Smart Reconciliation
          </p>
          <h2
            className="text-4xl leading-tight max-w-md font-semibold"
            style={{ fontFamily: "'Fraunces', serif", color: TEXT }}
          >
            Digitize statements, reconcile transactions.
          </h2>
          <p className="text-sm max-w-sm" style={{ color: "#C6CBD9" }}>
            Powered by OCR parsing and direct ledger integration for instant bank statement analysis.
          </p>
        </div>

        {/* Copyright + security badge */}
        <div
          className="flex items-center justify-between relative z-10 text-xs"
          style={{ color: TEXT_FAINT, animation: "fadeUp 0.6s ease both", animationDelay: "180ms" }}
        >
          <span>© {new Date().getFullYear()} Ledger Inc. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} style={{ color: "#34D399" }} />
            Bank-grade encryption
          </span>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${GOLD}14, transparent 70%)` }}
        />

        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10"
          style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, animation: "fadeUp 0.5s ease both" }}
        >
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:hidden"
              style={{ backgroundColor: `${GOLD}1A`, border: `1px solid ${GOLD}40` }}
            >
              <Landmark size={20} style={{ color: GOLD_SOFT }} />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
              Welcome Back
            </h1>
            <p className="text-sm mt-2" style={{ color: TEXT_FAINT }}>
              Sign in to manage your statements
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-center gap-2.5 mb-5 p-3.5 rounded-xl text-sm"
              style={{ backgroundColor: "#F871710D", border: "1px solid #F8717133", color: "#F87171" }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT_DIM }}>
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_FAINT }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className={`${inputClass} pl-12`}
                style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT_DIM }}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_FAINT }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className={`${inputClass} pl-12 pr-12`}
                style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: GOLD, color: INK, boxShadow: `0 10px 24px -12px ${GOLD}88` }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GOLD_SOFT; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GOLD; }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm mt-6" style={{ color: TEXT_FAINT }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: GOLD_SOFT }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}