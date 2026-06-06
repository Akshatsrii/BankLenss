import { useState, useRef, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_MB = 10;

const STEPS = [
  { id: "upload",    label: "Upload File"   },
  { id: "validate",  label: "Validating"    },
  { id: "extract",   label: "OCR Extract"   },
  { id: "parse",     label: "Parsing Data"  },
  { id: "done",      label: "Complete"      },
];

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function UploadCloud() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor"
      strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  );
}

export default function Upload() {
  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [error,     setError]     = useState("");
  const [step,      setStep]      = useState(0); // 0 = idle
  const [result,    setResult]    = useState(null);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef();

  const validate = (f) => {
    if (!ACCEPTED.includes(f.type)) return "Only PDF, PNG, or JPG files accepted.";
    if (f.size > MAX_MB * 1024 * 1024) return `File too large. Max ${MAX_MB}MB.`;
    return "";
  };

  const pickFile = (f) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
    setStep(0);
    setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const simulateProgress = (onDone) => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); onDone(); }
      setProgress(Math.min(Math.round(p), 100));
    }, 200);
  };

  const runPipeline = async () => {
    if (!file) return;
    setResult(null);
    setProgress(0);

    // Step 1 — validate
    setStep(1);
    await new Promise((r) => setTimeout(r, 600));

    // Step 2 — OCR (Firebase call)
    setStep(2);
    let firebaseResult = null;
    try {
      const helloWorld = httpsCallable(functions, "helloWorld");
      const [res] = await Promise.all([
        helloWorld(),
        new Promise((r) => setTimeout(r, 800)),
      ]);
      firebaseResult = res.data;
    } catch (err) {
      setError("Firebase error: " + err.message);
      setStep(0);
      return;
    }

    // Step 3 — parse
    setStep(3);
    await new Promise((r) => setTimeout(r, 500));

    // Step 4 — progress bar + done
    setStep(4);
    simulateProgress(() => {
      setStep(5);
      setResult(firebaseResult);
    });
  };

  const reset = () => {
    setFile(null); setStep(0); setResult(null);
    setError(""); setProgress(0);
  };

  const isRunning = step > 0 && step < 5;

  return (
    <div className="min-h-screen bg-[#080a12] text-slate-300 px-6 py-8"
      style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-1">OCR Pipeline</p>
        <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>
          Upload Statement
        </h1>
      </div>

      <div className="grid md:grid-cols-5 gap-4 max-w-4xl">

        {/* Left — dropzone + file info */}
        <div className="md:col-span-3 flex flex-col gap-4">

          {/* Drop Zone */}
          <div
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer
              ${file ? "cursor-default border-white/[0.06] bg-[#0f111a] py-6"
                : dragging ? "border-blue-500/60 bg-blue-500/5 py-16"
                : "border-white/[0.08] hover:border-white/20 bg-[#0f111a] py-16"}`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
              className="hidden" onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])} />

            {file ? (
              <div className="flex items-center gap-4 px-6 w-full">
                {/* File card */}
                <div className="w-10 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[13px] text-slate-200 font-medium truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type.split("/")[1].toUpperCase()}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="text-slate-600 hover:text-slate-300 transition-colors p-1 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className={`mb-4 transition-colors ${dragging ? "text-blue-400" : "text-slate-700"}`}>
                  <UploadCloud />
                </div>
                <p className="text-[13px] text-slate-400 mb-1">
                  {dragging ? "Drop it here" : "Drag & drop your bank statement"}
                </p>
                <p className="text-[11px] text-slate-600">PDF, PNG, JPG · Max 10 MB</p>
                <button className="mt-4 text-[11px] text-blue-400 border border-blue-500/30 hover:border-blue-400/60 px-4 py-1.5 rounded-md transition-colors">
                  Browse files
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 text-[12px] text-red-400">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Process button */}
          <button onClick={runPipeline} disabled={!file || isRunning}
            className={`w-full py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-200
              ${!file || isRunning
                ? "bg-white/5 border border-white/[0.06] text-slate-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-400 text-white border border-blue-500"}`}>
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                Processing…
              </>
            ) : step === 5 ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>
                Process Again
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run OCR Pipeline
              </>
            )}
          </button>

          {/* Progress bar */}
          {step >= 4 && (
            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-1.5">
                <span>Processing</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-[#0f111a] border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] text-emerald-400 uppercase tracking-wider">Firebase Response</p>
              </div>
              <pre className="text-[11px] text-slate-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right — pipeline steps */}
        <div className="md:col-span-2 bg-[#0f111a] border border-white/[0.06] rounded-xl p-5 h-fit">
          <p className="text-[11px] text-slate-600 uppercase tracking-widest mb-5">Pipeline</p>
          <div className="space-y-0">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done    = step > idx;
              const active  = step === idx;
              const pending = step < idx;
              return (
                <div key={s.id} className="flex gap-3">
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] transition-all duration-300
                      ${done   ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : active ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      :          "border-white/10 text-slate-700"}`}>
                      {done ? (
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
                      ) : active ? (
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      ) : (
                        <span className="font-mono">{idx}</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-px flex-1 my-1 min-h-[20px] transition-colors duration-500 ${done ? "bg-emerald-500/30" : "bg-white/[0.05]"}`} />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pb-5">
                    <p className={`text-[12px] font-medium transition-colors duration-300 ${
                      done ? "text-emerald-400" : active ? "text-blue-300" : "text-slate-600"
                    }`}>{s.label}</p>
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

          {/* Supported formats */}
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <p className="text-[10px] text-slate-700 uppercase tracking-wider mb-2">Supported</p>
            <div className="flex gap-1.5 flex-wrap">
              {["PDF", "PNG", "JPG"].map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded border border-white/[0.06] text-slate-600">{f}</span>
              ))}
            </div>
            <p className="text-[10px] text-slate-700 mt-3">Max 10 MB per file</p>
          </div>
        </div>
      </div>
    </div>
  );
}