/**
 * Signup.jsx
 *
 * New account creation with:
 * - Email + password + confirm password
 * - Client-side validation
 * - Firebase Auth createUserWithEmailAndPassword
 * - Auto-creates user doc in Firestore on success
 */

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email":        "Please enter a valid email address.",
  "auth/weak-password":        "Password must be at least 6 characters.",
};

const inputClass = `
  w-full bg-slate-900 border border-slate-700 rounded-xl
  px-4 py-3 text-slate-100 placeholder-slate-600 text-sm
  outline-none focus:border-blue-500 focus:ring-1
  focus:ring-blue-500/30 transition-colors disabled:opacity-50
`;

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState(null);
  const [loading, setLoading]       = useState(false);

  // ── Password strength ────────────────────────────────────────
  const strength = password.length === 0 ? null
    : password.length < 6   ? "weak"
    : password.length < 10  ? "fair"
    : "strong";

  const strengthColor = {
    weak:   "bg-red-500",
    fair:   "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthWidth = { weak: "w-1/3", fair: "w-2/3", strong: "w-full" };

  // ── Validation ───────────────────────────────────────────────
  function validate() {
    if (!email.trim())           return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email.";
    if (!password)               return "Password is required.";
    if (password.length < 6)    return "Password must be at least 6 characters.";
    if (password !== confirm)    return "Passwords do not match.";
    return null;
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleSignup = useCallback(async () => {
    const validationErr = validate();
    if (validationErr) { setError(validationErr); return; }

    setLoading(true);
    setError(null);

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth, email.trim(), password
      );

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid:       user.uid,
        email:     user.email,
        createdAt: serverTimestamp(),
      });

      navigate("/upload", { replace: true });
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, confirm, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex items-center
                    justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
                          w-14 h-14 rounded-2xl bg-blue-600/20
                          border border-blue-500/30 mb-4">
            <span className="text-2xl">🏦</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 text-sm mt-1">
            Start digitizing your bank statements
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
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Min 6 characters"
                disabled={loading}
                className={`${inputClass} pl-9 pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {strength && (
              <div className="mt-2">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300
                                   ${strengthColor[strength]} ${strengthWidth[strength]}`} />
                </div>
                <p className={`text-xs mt-1 capitalize
                               ${strength === "weak"   ? "text-red-400"    :
                                 strength === "fair"   ? "text-yellow-400" :
                                                         "text-green-400"}`}>
                  {strength} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                         text-slate-500 pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Re-enter password"
                disabled={loading}
                className={`${inputClass} pl-9 pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Match indicator */}
              {confirm && password && (
                <div className="absolute right-9 top-1/2 -translate-y-1/2">
                  <CheckCircle
                    size={14}
                    className={password === confirm ? "text-green-400" : "text-red-400"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white font-medium text-sm transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2
                               border-white/30 border-t-white animate-spin" />
            ) : "Create Account"}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300
                                       transition-colors font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}