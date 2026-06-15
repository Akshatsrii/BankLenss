/**
 * Profile.jsx
 * User profile — email, joined date, change password, sign out
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Lock, LogOut, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const inputClass = `
  w-full bg-slate-900 border border-slate-700 rounded-xl
  px-4 py-3 text-slate-100 placeholder-slate-600 text-sm
  outline-none focus:border-blue-500 focus:ring-1
  focus:ring-blue-500/30 transition-colors disabled:opacity-50
`;

export default function Profile() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwSuccess, setPwSuccess]   = useState(false);
  const [pwError, setPwError]       = useState(null);

  const handleChangePassword = useCallback(async () => {
    setPwError(null);
    setPwSuccess(false);

    if (!currentPw) { setPwError("Enter your current password."); return; }
    if (!newPw)     { setPwError("Enter a new password."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }

    setPwLoading(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      const msg = {
        "auth/wrong-password":       "Current password is incorrect.",
        "auth/weak-password":        "New password is too weak.",
        "auth/too-many-requests":    "Too many attempts. Try again later.",
        "auth/requires-recent-login":"Please sign out and sign back in first.",
      }[err.code] || err.message;
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  }, [user, currentPw, newPw, confirmPw]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || "??";
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account settings.</p>
        </div>

        {/* Avatar + info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#1d4ed8] flex items-center justify-center text-xl font-bold text-blue-300 border border-blue-500/30 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{user?.email}</p>
            <p className="text-slate-500 text-xs mt-0.5">Member since {joinedDate}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
            </span>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={15} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-200">Change Password</h2>
          </div>

          {pwSuccess && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              <CheckCircle size={15} /> Password updated successfully.
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle size={15} /> {pwError}
            </div>
          )}

          {/* Current password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                disabled={pwLoading}
                className={`${inputClass} pr-10`}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 6 characters"
                disabled={pwLoading}
                className={`${inputClass} pr-10`}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              disabled={pwLoading}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white font-medium text-sm transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {pwLoading
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : "Update Password"
            }
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl border border-red-500/20
                     text-red-400 hover:bg-red-500/10 text-sm font-medium
                     flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={15} /> Sign Out
        </button>

      </div>
    </div>
  );
}