import { useState, useRef, useCallback } from "react";
import { ref, uploadBytesResumable } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { storage, functions } from "../firebase";

const ACCEPTED = ["application/pdf"];
const MAX_MB = 20;

const STEPS = [
  { id: "upload",   label: "Upload to Storage" },
  { id: "unlock",   label: "Unlock PDF"         },
  { id: "detect",   label: "Detect Bank"        },
  { id: "parse",    label: "Parse Transactions" },
  { id: "save",     label: "Save to Firestore"  },
];

// Friendly messages per Firebase error code returned by processStatement
const ERROR_MESSAGES = {
  WRONG_PASSWORD:   "Incorrect PDF password. Please check and try again.",
  CORRUPT_PDF:      "This file appears corrupted or is not a valid PDF.",
  UNSUPPORTED_BANK: "Bank not supported yet. Supported: SBI, HDFC, ICICI, Axis.",
  SCANNED_PDF:      "This looks like a scanned PDF. OCR is not supported in v1.",
  unauthenticated:  "You must be logged in to upload statements.",
  internal:         "Something went wrong on our end. Please try again.",
};

function friendlyError(err) {
  // err.details?.code comes from HttpsError thrown in Cloud Function
  const code =
    err?.details?.code ||
    err?.code?.replace("functions/", "") ||
    "internal";
  return ERROR_MESSAGES[code] || err?.message || ERROR_MESSAGES.internal;
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"
      stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function UploadCloud() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none"
      stroke="currentColor" strokeWidth={1.2}
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  );
}

export default function Upload() {
  const [file,        setFile]        = useState(null);
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState("");
  const [step,        setStep]        = useState(0); // 0 = idle, 1-5 = running, 6 = done
  const [progress,    setProgress]    = useState(0); // upload %
  const [result,      setResult]      = useState(null);
  const [warnings,    setWarnings]    = useState([]);
  const inputRef = useRef();

  // ── Validation ─────────────────────────────────────────────
  const validate = (f) => {
    if (!ACCEPTED.includes(f.type))
      return "Only PDF files are accepted.";
    if (f.size > MAX_MB * 1024 * 1024)
      return `File too large. Max ${MAX_MB} MB. Yours is ${(f.size / 1024 / 1024).toFixed(1)} MB.`;
    return "";
  };

  const pickFile = (f) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
    setStep(0);
    setResult(null);
    setWarnings([]);
  };

  // ── Drag & drop ────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  // ── Main pipeline ──────────────────────────────────────────
  const runPipeline = async () => {
    if (!file) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to upload statements.");
      return;
    }

    setResult(null);
    setWarnings([]);
    setError("");
    setProgress(0);

    // ── Step 1: Upload to Firebase Storage ──────────────────
    setStep(1);
    const uploadId    = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storagePath = `statements/${user.uid}/${uploadId}.pdf`;

    let uploadedPath;
    try {
      await new Promise((resolve, reject) => {
        const storageRef  = ref(storage, storagePath);
        const uploadTask  = uploadBytesResumable(storageRef, file, {
          contentType: "application/pdf",
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(pct);
          },
          (err) => reject(err),
          () => { uploadedPath = storagePath; resolve(); }
        );
      });
    } catch (err) {
      setError("Upload failed. Check your connection and try again.");
      setStep(0);
      return;
    }

    // ── Steps 2-4: Shown while Cloud Function runs ───────────
    // Animate through unlock → detect → parse while we wait
    setStep(2);
    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    // ── Step 5: Call processStatement ───────────────────────
    try {
      const processStatement = httpsCallable(functions, "processStatement");
      const response = await processStatement({
        storagePath: uploadedPath,
        password:    password || "",
        fileName:    file.name,
      });

      clearInterval(stepTimer);
      setStep(5);

      const { bank, transactionCount, statementId, warnings: warns } = response.data;

      setResult({ bank, transactionCount, statementId });
      if (warns && warns.length > 0) setWarnings(warns);

    } catch (err) {
      clearInterval(stepTimer);
      setStep(0);
      setError(friendlyError(err));
    }
  };

  const reset = () => {
    setFile(null);
    setStep(0);
    setResult(null);
    setError("");
    setProgress(0);
    setWarnings([]);
    setPassword("");
  };

  const isRunning = step >= 1 && step < 5;
  const isDone    = step === 5;

  return (
    <div
      className="min-h-screen bg-[#0A0E17] text-slate-300 px-6 py-8 font-sans"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1 font-semibold">
          OCR Pipeline
        </p>
        <h1
          className="text-2xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Upload Statement
        </h1>
      </div>

      <div className="grid md:grid-cols-5 gap-4 max-w-4xl">

        {/* ── Left: dropzone + password + controls ── */}
        <div className="md:col-span-3 flex flex-col gap-4">

          {/* Drop Zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center
              ${file
                ? "cursor-default border-white/[0.06] bg-[#0f111a] py-6"
                : dragging
                  ? "border-blue-500/60 bg-blue-500/5 py-16 cursor-pointer"
                  : "border-white/[0.08] hover:border-white/20 bg-[#0f111a] py-16 cursor-pointer"
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex items-center gap-4 px-6 w-full">
                <div className="w-10 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20
                                flex items-center justify-center text-blue-400 flex-shrink-0">
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] text-slate-200 font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                {!isRunning && (
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-slate-600 hover:text-slate-300 transition-colors p-1 flex-shrink-0"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"
                      stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`mb-4 transition-colors ${dragging ? "text-blue-400" : "text-slate-700"}`}>
                  <UploadCloud />
                </div>
                <p className="text-[13px] text-slate-400 mb-1">
                  {dragging ? "Drop it here" : "Drag & drop your bank statement"}
                </p>
                <p className="text-[11px] text-slate-600">PDF only · Max {MAX_MB} MB</p>
                <button className="mt-4 text-[11px] text-blue-400 border border-blue-500/30
                                   hover:border-blue-400/60 px-4 py-1.5 rounded-md transition-colors">
                  Browse files
                </button>
              </>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-[11px] text-slate-600 uppercase tracking-widest mb-2">
              PDF Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isRunning}
                placeholder="Enter PDF password (if protected)"
                className="w-full bg-[#0f111a] border border-white/[0.08] rounded-xl
                           px-4 py-3 pr-11 text-[13px] text-slate-200
                           placeholder-slate-700 outline-none
                           focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"
                    stroke="currentColor" strokeWidth={1.8}>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"
                    stroke="currentColor" strokeWidth={1.8}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-700 mt-1.5">
              Leave blank if the PDF is not password-protected.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/20
                            rounded-lg px-4 py-3 text-[12px] text-red-400">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none"
                stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Warnings (scanned page, etc.) */}
          {warnings.length > 0 && (
            <div className="flex items-start gap-2 bg-yellow-500/8 border border-yellow-500/20
                            rounded-lg px-4 py-3 text-[12px] text-yellow-400">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none"
                stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div className="space-y-1">
                {warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            </div>
          )}

          {/* Upload progress bar (step 1) */}
          {step === 1 && (
            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
                <span>Uploading to Storage</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Process button */}
          <button
            onClick={runPipeline}
            disabled={!file || isRunning}
            className={`w-full py-3 rounded-xl text-[13px] font-medium flex items-center
                        justify-center gap-2 transition-all duration-200
              ${!file || isRunning
                ? "bg-white/5 border border-white/[0.06] text-slate-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-400 text-white border border-blue-500"
              }`}
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                Processing…
              </>
            ) : isDone ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Upload Another
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run OCR Pipeline
              </>
            )}
          </button>

          {/* Success result */}
          {result && (
            <div className="bg-[#0f111a] border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] text-emerald-400 uppercase tracking-wider">
                  Statement Processed
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Bank</span>
                  <span className="text-slate-200 font-medium">{result.bank}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Transactions</span>
                  <span className="text-emerald-400 font-medium">
                    {result.transactionCount} extracted
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-slate-600">Statement ID</span>
                  <span className="text-slate-500 font-mono text-[10px] truncate max-w-[160px]">
                    {result.statementId}
                  </span>
                </div>
              </div>
              <a
                href="/transactions"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2
                           rounded-lg border border-blue-500/20 text-blue-400
                           hover:bg-blue-500/10 transition-colors text-[12px]"
              >
                View Transactions →
              </a>
            </div>
          )}
        </div>

        {/* ── Right: pipeline steps ── */}
        <div className="md:col-span-2 bg-[#0f111a] border border-white/[0.06]
                        rounded-xl p-5 h-fit">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-5">
            Pipeline
          </p>

          <div className="space-y-0">
            {STEPS.map((s, i) => {
              const idx     = i + 1;
              const done    = step > idx || isDone;
              const active  = step === idx;
              const pending = !done && !active;

              return (
                <div key={s.id} className="flex gap-3">
                  {/* Step circle + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center
                                    flex-shrink-0 text-[10px] transition-all duration-300
                      ${done
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : active
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-white/10 text-slate-700"
                      }`}>
                      {done ? (
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none"
                          stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : active ? (
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      ) : (
                        <span className="font-mono">{idx}</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px flex-1 my-1 min-h-[20px] transition-colors duration-500
                        ${done ? "bg-emerald-500/30" : "bg-white/[0.05]"}`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pb-5">
                    <p className={`text-[12px] font-medium transition-colors duration-300
                      ${done    ? "text-emerald-400"
                      : active  ? "text-blue-300"
                      :           "text-slate-600"}`}>
                      {s.label}
                    </p>
                    {active && (
                      <p className="text-[10px] text-slate-700 mt-0.5">In progress…</p>
                    )}
                    {done && (
                      <p className="text-[10px] text-slate-700 mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supported banks */}
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <p className="text-[10px] text-slate-700 uppercase tracking-wider mb-2">
              Supported Banks
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {["SBI", "HDFC", "ICICI", "Axis"].map((b) => (
                <span key={b}
                  className="text-[10px] px-2 py-0.5 rounded border
                             border-white/[0.06] text-slate-600">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-700 mt-3">
              PDF only · Max {MAX_MB} MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}