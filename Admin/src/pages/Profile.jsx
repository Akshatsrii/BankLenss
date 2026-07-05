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
import { Lock, LogOut, CheckCircle, AlertCircle, Eye, EyeOff, UserRound } from "lucide-react";

const INK        = "#0A0E17";
const SURFACE    = "#12161F";
const BORDER     = "#1F2530";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT       = "#EDEFF3";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";
const RED        = "#F87171";

const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors disabled:opacity-50";

const FONT_STACK = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  @keyframes fadeUp    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes popIn     { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes livePulse {
    0%   { box-shadow: 0 0 0 0 ${GREEN}66; }
    70%  { box-shadow: 0 0 0 6px ${GREEN}00; }
    100% { box-shadow: 0 0 0 0 ${GREEN}00; }
  }
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
    <div
      className="min-h-screen p-6 md:p-10 relative overflow-hidden"
      style={{ backgroundColor: INK, color: TEXT_DIM, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONT_STACK}</style>

      {/* Ambient glow accents */}
      <div
        className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}12, transparent 70%)` }}
      />
      <div
        className="absolute bottom-0 -left-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, #60A5FA0D, transparent 70%)` }}
      />

      <div className="max-w-lg mx-auto space-y-6 relative">

        <div className="flex items-center gap-3" style={{ animation: "fadeUp 0.45s ease both" }}>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${GOLD}1A`,
              border: `1px solid ${GOLD}40`,
              animation: "floatSlow 4.5s ease-in-out infinite",
            }}
          >
            <UserRound size={19} style={{ color: GOLD_SOFT }} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] mb-0.5" style={{ color: GOLD_SOFT }}>Account</p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Fraunces', serif", color: TEXT }}>
              Profile
            </h1>
          </div>
        </div>
        <p className="text-sm -mt-4" style={{ color: TEXT_FAINT, animation: "fadeUp 0.5s ease both", animationDelay: "40ms" }}>
          Manage your account settings.
        </p>

        {/* Avatar + info */}
        <div
          className="rounded-2xl p-6 flex items-center gap-5 transition-shadow duration-300"
          style={{
            backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
            animation: "fadeUp 0.5s ease both", animationDelay: "100ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{
              background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}0D)`,
              border: `1px solid ${GOLD}40`,
              color: GOLD_SOFT,
              fontFamily: "'Fraunces', serif",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: TEXT }}>{user?.email}</p>
            <p className="text-xs mt-0.5" style={{ color: TEXT_FAINT }}>Member since {joinedDate}</p>
            <span
              className="inline-flex items-center gap-1 mt-2 text-[11px] px-2 py-0.5 rounded-full"
              style={{ color: GREEN, backgroundColor: `${GREEN}1A`, border: `1px solid ${GREEN}33` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN, animation: "livePulse 2s infinite" }} /> Active
            </span>
          </div>
        </div>

        {/* Change password */}
        <div
          className="rounded-2xl p-6 space-y-4 transition-shadow duration-300"
          style={{
            backgroundColor: SURFACE, border: `1px solid ${BORDER}`,
            animation: "fadeUp 0.5s ease both", animationDelay: "160ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 36px -20px rgba(0,0,0,0.55)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${GOLD}14` }}>
              <Lock size={13} style={{ color: GOLD_SOFT }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: "#E4E6EB" }}>Change Password</h2>
          </div>

          {pwSuccess && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ backgroundColor: `${GREEN}14`, border: `1px solid ${GREEN}33`, color: GREEN, animation: "popIn 0.2s ease both" }}
            >
              <CheckCircle size={15} /> Password updated successfully.
            </div>
          )}
          {pwError && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ backgroundColor: `${RED}0D`, border: `1px solid ${RED}33`, color: RED, animation: "popIn 0.2s ease both" }}
            >
              <AlertCircle size={15} /> {pwError}
            </div>
          )}

          {/* Current password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_DIM }}>Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                disabled={pwLoading}
                className={`${inputClass} pr-10`}
                style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_DIM }}>New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min 6 characters"
                disabled={pwLoading}
                className={`${inputClass} pr-10`}
                style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
                onFocus={(e) => (e.target.style.borderColor = GOLD)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: TEXT_FAINT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
                onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: TEXT_DIM }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              disabled={pwLoading}
              className={inputClass}
              style={{ backgroundColor: INK, border: `1px solid ${BORDER}`, color: TEXT }}
              onFocus={(e) => (e.target.style.borderColor = GOLD)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: GOLD, color: INK }}
            onMouseEnter={(e) => { if (!pwLoading) e.currentTarget.style.backgroundColor = GOLD_SOFT; }}
            onMouseLeave={(e) => { if (!pwLoading) e.currentTarget.style.backgroundColor = GOLD; }}
          >
            {pwLoading
              ? <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${INK}4D`, borderTopColor: INK }} />
              : "Update Password"
            }
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl text-sm font-medium
                     flex items-center justify-center gap-2 transition-colors"
          style={{ border: `1px solid ${RED}33`, color: RED, animation: "fadeUp 0.5s ease both", animationDelay: "220ms" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${RED}0D`)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LogOut size={15} /> Sign Out
        </button>

      </div>
    </div>
  );
}