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

const inputClass = `  w-full
  bg-[#0F1D39]
  border border-[#1D335C]
  rounded-xl
  px-4 py-4
  text-white
  placeholder-slate-500
  outline-none
  focus:border-blue-500
  transition-all`;

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

function validate() {
if (!email.trim()) return "Email is required.";

if (!/\S+@\S+\.\S+/.test(email))
  return "Enter a valid email.";

if (!password)
  return "Password is required.";

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

if (authLoading) {
return ( <div className="h-screen bg-[#081327] flex items-center justify-center"> <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /> </div>
);
}

if (user) {
return <Navigate to="/dashboard" replace />;
}

return ( <div className="h-screen overflow-hidden flex bg-[#081327]">

  {/* LEFT IMAGE */}
  <div className="hidden lg:flex w-1/2 h-screen items-center justify-center bg-[#071226] overflow-hidden">

    <img
      src="/yy.png"
      alt="Bank Illustration"
      className="
        w-[92%]
        h-[92%]
        object-contain
        drop-shadow-[0_0_40px_rgba(59,130,246,0.25)]
      "
    />

  </div>

  {/* RIGHT SIGNUP */}
  <div className="w-full lg:w-1/2 h-screen flex items-center justify-center px-8">

    <div
      className="
        w-full
        max-w-md
        bg-[#0B1730]
        border
        border-[#1E335B]
        rounded-3xl
        p-8
        shadow-2xl
      "
    >
      {/* HEADER */}
      <div className="text-center mb-8">

        <div
          className="
            w-20
            h-20
            mx-auto
            flex
            items-center
            justify-center
            rounded-3xl
            bg-blue-600
            mb-6
          "
        >
          <span className="text-4xl text-white">
            🏦
          </span>
        </div>

        <h1 className="text-4xl font-bold text-white">
          Create Account
        </h1>

        <p className="text-slate-400 mt-3">
          Start digitizing your bank statements
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* EMAIL */}
      <div className="mb-5">
        <label className="block text-slate-300 mb-2 font-medium">
          Email
        </label>

        <div className="relative">
          <Mail
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Enter your email"
            className={`${inputClass} pl-12`}
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div className="mb-4">
        <label className="block text-slate-300 mb-2 font-medium">
          Password
        </label>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Enter your password"
            className={`${inputClass} pl-12 pr-12`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPw(!showPw)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showPw ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {strength && (
          <div className="mt-3">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthColor[strength]} ${strengthWidth[strength]}`}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2 capitalize">
              {strength} password
            </p>
          </div>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="mb-8">
        <label className="block text-slate-300 mb-2 font-medium">
          Confirm Password
        </label>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
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
            placeholder="Confirm password"
            className={`${inputClass} pl-12 pr-16`}
          />

          {confirm && (
            <CheckCircle
              size={18}
              className={`absolute right-12 top-1/2 -translate-y-1/2 ${
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showConfirm ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSignup}
        disabled={loading}
        className="
          w-full
          py-4
          rounded-xl
          bg-blue-600
          hover:bg-blue-500
          text-white
          font-semibold
          transition-all
          disabled:opacity-50
        "
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

      {/* LOGIN LINK */}
      <p className="text-center text-slate-400 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          Sign In
        </Link>
      </p>

    </div>

  </div>

</div>

);
}
