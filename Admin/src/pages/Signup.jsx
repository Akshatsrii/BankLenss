import { useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const FIREBASE_ERRORS = {
  "auth/email-already-in-use":
    "An account with this email already exists.",
  "auth/invalid-email":
    "Please enter a valid email address.",
  "auth/weak-password":
    "Password must be at least 6 characters.",
};

const inputClass = `
  w-full bg-slate-900 border border-slate-700 rounded-xl
  px-4 py-3 text-slate-100 placeholder-slate-600 text-sm
  outline-none focus:border-blue-500 focus:ring-1
  focus:ring-blue-500/30 transition-colors disabled:opacity-50
`;

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // ALL HOOKS FIRST
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

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email))
      return "Enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";
    if (password !== confirm)
      return "Passwords do not match.";

    return null;
  }

  const handleSignup = useCallback(async () => {
    const validationErr = validate();

    if (validationErr) {
      setError(validationErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          uid: credential.user.uid,
          email: credential.user.email,
          createdAt: serverTimestamp(),
        }
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        FIREBASE_ERRORS[err.code] ||
          err.message ||
          "Signup failed. Please try again."
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

  // AFTER ALL HOOKS
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Create Account
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Start digitizing your bank statements
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className={`${inputClass} pl-10`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className={`${inputClass} pl-10 pr-10`}
                placeholder="Minimum 6 characters"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPw(!showPw)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPw ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            {strength && (
              <div className="mt-2">
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor[strength]} ${strengthWidth[strength]}`}
                  />
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {strength} password
                </p>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                value={confirm}
                onChange={(e) =>
                  setConfirm(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className={`${inputClass} pl-10 pr-16`}
                placeholder="Confirm password"
              />

              {confirm && (
                <CheckCircle
                  size={16}
                  className={`absolute right-10 top-1/2 -translate-y-1/2 ${
                    password === confirm
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
              )}

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showConfirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </div>

        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}