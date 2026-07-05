import { useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/invalid-credential": "Incorrect email or password.",
};

const inputClass = `w-full bg-[#0F1422] border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all`;

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

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex bg-[#0A0E17] font-sans">
      {/* Decorative Left Side */}
      <div className="hidden lg:flex w-1/2 h-screen flex-col justify-between p-12 bg-gradient-to-b from-[#0F1422] to-[#0A0E17] border-r border-slate-800/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 select-none pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-500 blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-500 blur-[150px]" />
        </div>

        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 16 16">
              <path d="M2 4h12v1.5H2zM3 7h10v1H3zM4 10h8v1H4z" />
              <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="white" strokeWidth="1.2" />
            </svg>
          </div>
          <span className="text-slate-200 text-lg font-bold tracking-wide">
            Bank<span className="text-blue-400">Digitizer</span>
          </span>
        </div>

        {/* Hero Quote */}
        <div className="space-y-4 relative z-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
            Smart Reconciliation
          </p>
          <h2 className="text-4xl font-semibold leading-tight text-white max-w-md">
            Digitize statements, reconcile transactions.
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Powered by OCR parsing and direct ledger integration for instant bank statement analysis.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} Ledger Inc. All rights reserved.
        </p>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 block lg:hidden opacity-5 select-none pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500 blur-[120px]" />
        </div>

        <div className="w-full max-w-md bg-[#12161F] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Sign in to manage your statements
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                className={`${inputClass} pl-12`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className={`${inputClass} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Signup Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
