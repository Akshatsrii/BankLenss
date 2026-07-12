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
  "w-full rounded-xl px-4 py-2.5 outline-none transition-all text-sm";

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
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden py-6 px-6" style={{ backgroundColor: INK }}>
      <style>{FONT_STACK}</style>

      {/* Decorative Full-screen Backdrop Image */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ animation: "kenBurns 20s ease-out both" }}
      />
      
      {/* Dark Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,14,23,0.85) 0%, rgba(10,14,23,0.92) 50%, rgba(10,14,23,0.98) 100%)",
        }}
      />

      {/* Ambient Gold Glow Accent */}
      <div
        className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}15, transparent 70%)` }}
      />

      {/* Centered Content Container */}
      <div className="w-full max-w-md relative z-10" style={{ animation: "fadeUp 0.5s ease both" }}>
        
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4.5s ease-in-out infinite",
            }}
          >
            <Landmark size={16} style={{ color: GOLD_SOFT }} />
          </div>
          <span className="text-lg font-semibold tracking-wide" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
            Ledger
          </span>
        </div>

        {/* Login Card with Frosted Glass Effect */}
        <div
          className="rounded-3xl p-6 shadow-2xl transition-all duration-300"
          style={{
            backgroundColor: "rgba(18, 22, 31, 0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="text-center mb-4">
            <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
              Welcome Back
            </h1>
            <p className="text-[11px] mt-1" style={{ color: TEXT_DIM }}>
              Sign in to digitize and manage your statements
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-center gap-2.5 mb-4 p-3 rounded-xl text-xs"
              style={{ backgroundColor: "#F871710D", border: "1px solid #F8717133", color: "#F87171" }}
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-3">
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: TEXT_DIM }}>
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_FAINT }} />
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

          {/* Password Input */}
          <div className="mb-5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: TEXT_DIM }}>
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: TEXT_FAINT }} />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
            style={{ backgroundColor: GOLD, color: INK, boxShadow: `0 6px 16px -6px ${GOLD}AA` }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GOLD_SOFT; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = GOLD; }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Switch to Signup Link */}
          <p className="text-center text-[11px] mt-4" style={{ color: TEXT_FAINT }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: GOLD_SOFT }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Footer (Copyright & Security) */}
        <div
          className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] gap-2 px-2 text-center"
          style={{ color: TEXT_FAINT }}
        >
          <span>© {new Date().getFullYear()} Ledger Inc.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} style={{ color: "#34D399" }} />
            Bank-grade encryption
          </span>
        </div>

      </div>
    </div>
  );
}