import { useState, useCallback } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import {
Mail,
Lock,
Eye,
EyeOff,
AlertCircle,
} from "lucide-react";

const FIREBASE_ERRORS = {
"auth/user-not-found": "No account found with this email.",
"auth/wrong-password": "Incorrect password. Please try again.",
"auth/invalid-email": "Please enter a valid email address.",
"auth/too-many-requests": "Too many attempts. Please wait and try again.",
"auth/user-disabled": "This account has been disabled.",
"auth/invalid-credential": "Incorrect email or password.",
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

export default function Login() {
const navigate = useNavigate();
const { user, loading: authLoading } = useAuth();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPw] = useState(false);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

function validate() {
if (!email.trim()) return "Email is required.";

```
if (!/\S+@\S+\.\S+/.test(email))
  return "Enter a valid email.";

if (!password)
  return "Password is required.";

if (password.length < 6)
  return "Password must be at least 6 characters.";

return null;
```

}

const handleLogin = useCallback(async () => {
const validationErr = validate();

```
if (validationErr) {
  setError(validationErr);
  return;
}

setLoading(true);
setError(null);

try {
  await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  navigate("/dashboard", {
    replace: true,
  });
} catch (err) {
  setError(
    FIREBASE_ERRORS[err.code] ||
    "Login failed. Please try again."
  );
} finally {
  setLoading(false);
}
```

}, [email, password, navigate]);

const handleKeyDown = (e) => {
if (e.key === "Enter") {
handleLogin();
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

```
  {/* LEFT IMAGE SECTION */}
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

  {/* RIGHT LOGIN SECTION */}
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
      {/* LOGO */}
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
          Welcome Back
        </h1>

        <p className="text-slate-400 mt-3">
          Sign in to Bank Statement Digitizer
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
      <div className="mb-8">

        <label className="block text-slate-300 mb-2 font-medium">
          Password
        </label>

        <div className="relative">

          <Lock
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
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
              setShowPw(!showPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        </div>

      </div>

      {/* LOGIN BUTTON */}
      <button
        onClick={handleLogin}
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
          ? "Signing In..."
          : "Sign In"}
      </button>

      {/* SIGNUP LINK */}
      <p className="text-center text-slate-400 mt-6">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          Create one
        </Link>
      </p>

    </div>

  </div>

</div>

);
}
