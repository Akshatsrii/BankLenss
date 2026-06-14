/**
 * Login.jsx
 *
 * Email + password login with:
 * - Client-side validation
 * - Firebase Auth signInWithEmailAndPassword
 * - Friendly error messages per Firebase error code
 * - Link to Signup page
 */

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/user-not-found":       "No account found with this email.",
  "auth/wrong-password":       "Incorrect password. Please try again.",
  "auth/invalid-email":        "Please enter a valid email address.",
  "auth/too-many-requests":    "Too many attempts. Please wait and try again.",
  "auth/user-disabled":        "This account has been disabled.",
  "auth/invalid-credential":   "Incorrect email or password.",
};

const inputClass = `
  w-full bg-slate-900 border border-slate-700 rounded-xl
  px-4 py-3 text-slate-100 placeholder-slate-600 text-sm
  outline-none focus:border-blue-500 focus:ring-1
  focus:ring-blue-500/30 transition-colors disabled:opacity-50
`;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPw]   = useState(false);
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(false);

  // ── Validation ──────────────────────────────────────────────
  function validate() {
    if (!email.trim())    return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email.";
    if (!password)        return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    const validationErr = validate();
    if (validationErr) { setError(validationErr); return; }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/upload", { replace: true });
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 rounded-2xl bg-blue-600/20
                          border border-blue-500/30 mb-4">
            <span className="text-2xl">🏦</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to Bank Statement Digitizer
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800
                        rounded-2xl p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5
                            bg-red-500/10 border border-red-500/20
                            rounded-lg text-red-400 text-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                disabled={loading}
                className={`${inputClass} pl-9`}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                disabled={loading}
                className={`${inputClass} pl-9 pr-11`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white font-medium text-sm transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2
                               border-white/30 border-t-white animate-spin" />
            ) : "Sign In"}
          </button>
        </div>

        {/* Signup link */}
        <p className="text-center text-slate-500 text-sm mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300
                                        transition-colors font-medium">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}