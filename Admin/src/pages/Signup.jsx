import { useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
};

const inputClass = `w-full bg-[#0F1422] border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all`;

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const strength =
    password.length === 0
      ? null
      : password.length < 6
      ? "weak"
      : password.length < 10
      ? "fair"
      : "strong";

  const strengthColor = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const strengthWidth = {
    weak: "w-1/3",
    fair: "w-2/3",
    strong: "w-full",
  };

  const handleSignup = useCallback(async () => {
    let validationErr = null;
    if (!email.trim()) validationErr = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) validationErr = "Enter a valid email.";
    else if (!password) validationErr = "Password is required.";
    else if (password.length < 6) validationErr = "Password must be at least 6 characters.";
    else if (password !== confirm) validationErr = "Passwords do not match.";

    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        createdAt: serverTimestamp(),
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        FIREBASE_ERRORS[err.code] || err.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, confirm, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignup();
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
            Get Started
          </p>
          <h2 className="text-4xl font-semibold leading-tight text-white max-w-md">
            Create your account to start digitizing.
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Analyze your finances across major Indian banks like SBI, HDFC, ICICI, and Axis in minutes.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} Ledger Inc. All rights reserved.
        </p>
      </div>

      {/* Right Signup Section */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center px-6 relative overflow-y-auto py-12">
        <div className="absolute inset-0 block lg:hidden opacity-5 select-none pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500 blur-[120px]" />
        </div>

        <div className="w-full max-w-md bg-[#12161F] border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Start digitizing your bank statements
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
          <div className="mb-4">
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
          <div className="mb-4">
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="At least 6 characters"
                className={`${inputClass} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {strength && (
              <div className="mt-2.5 flex items-center justify-between">
                <div className="w-[60%] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthColor[strength]} ${strengthWidth[strength]} transition-all duration-300`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {strength} password
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-8">
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm password"
                className={`${inputClass} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {confirm && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {password === confirm ? (
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Passwords match</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
