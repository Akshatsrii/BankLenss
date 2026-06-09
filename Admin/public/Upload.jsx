/**
 * Upload.jsx
 *
 * Features:
 * - Drag-and-drop + click-to-browse file input
 * - PDF type + 20MB size validation
 * - Password field
 * - Upload progress bar
 * - Processing state
 * - Success toast with bank + transaction count
 * - Friendly error messages per error code
 */

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  FileText,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

import { useUpload } from "../hooks/useUpload";
import ProgressBar from "../components/ProgressBar";
import Toast from "../components/Toast";

const MAX_FILE_SIZE_MB = 20;

export default function Upload() {
  const navigate = useNavigate();

  // Form state
  const [file, setFile]               = useState(null);
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [fileError, setFileError]     = useState(null);
  const [toast, setToast]             = useState(null);

  const fileInputRef = useRef(null);

  const {
    upload,
    reset,
    phase,
    uploadProgress,
    error,
    result,
    isLoading,
  } = useUpload();

  // ── File validation ──────────────────────────────────────────
  const validateAndSetFile = useCallback((selected) => {
    setFileError(null);

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setFileError("Only PDF files are accepted.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(
        `File must be under ${MAX_FILE_SIZE_MB}MB. ` +
        `Yours is ${(selected.size / 1024 / 1024).toFixed(1)}MB.`
      );
      return;
    }

    setFile(selected);
  }, []);

  // ── Drag and drop handlers ───────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }, [validateAndSetFile]);

  const onFileInputChange = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSetFile(selected);
  }, [validateAndSetFile]);

  const removeFile = useCallback(() => {
    setFile(null);
    setFileError(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [reset]);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!file || isLoading) return;

    const uploadResult = await upload(file, password);

    // result is set inside useUpload — watch for it below
  }, [file, password, isLoading, upload]);

  // ── Watch result from hook ───────────────────────────────────
  // When result appears, show success toast
  if (result && toast?.type !== "success") {
    setToast({
      type: "success",
      title: `${result.bank} statement processed`,
      message: `${result.transactionCount} transactions extracted successfully.`,
    });
  }

  // When error appears (from hook), show error toast
  if (error && toast?.type !== "error") {
    setToast({
      type: "error",
      title: "Upload failed",
      message: error,
    });
  }

  const canSubmit = file && !fileError && !isLoading;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Upload Statement
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Upload a password-protected bank statement PDF to extract
            transactions. Supports SBI, HDFC, ICICI, and Axis Bank.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !file && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative rounded-2xl border-2 border-dashed
            transition-all duration-200 cursor-pointer
            ${file
              ? "border-blue-500/50 bg-blue-500/5 cursor-default"
              : dragOver
                ? "border-blue-400 bg-blue-400/10 scale-[1.01]"
                : "border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onFileInputChange}
            disabled={isLoading}
          />

          {!file ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center
                            py-14 px-6 text-center">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center mb-4
                transition-colors
                ${dragOver
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-slate-800 text-slate-400"
                }
              `}>
                <UploadIcon size={26} />
              </div>
              <p className="text-slate-300 font-medium">
                {dragOver
                  ? "Drop it here"
                  : "Drag & drop your PDF here"
                }
              </p>
              <p className="text-slate-500 text-sm mt-1">
                or click to browse
              </p>
              <p className="text-slate-600 text-xs mt-3">
                PDF only · Max {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          ) : (
            /* File selected */
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15
                              flex items-center justify-center shrink-0">
                <FileText size={22} className="text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {!isLoading && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             text-slate-500 hover:text-slate-300
                             hover:bg-slate-700 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* File error */}
        {fileError && (
          <div className="mt-3 flex items-start gap-2
                          text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Password field */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            PDF Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter PDF password"
              className="w-full bg-slate-900 border border-slate-700
                         rounded-xl px-4 py-3 pr-11
                         text-slate-100 placeholder-slate-600
                         text-sm outline-none
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword
                ? <EyeOff size={17} />
                : <Eye     size={17} />
              }
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Leave blank if the PDF is not password-protected.
          </p>
        </div>

        {/* Progress bar */}
        <ProgressBar
          phase={phase}
          uploadProgress={uploadProgress}
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            mt-6 w-full py-3 px-6 rounded-xl font-medium text-sm
            flex items-center justify-center gap-2
            transition-all duration-200
            ${canSubmit
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 cursor-pointer"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2
                               border-white/30 border-t-white
                               animate-spin" />
              {phase === "uploading"  ? "Uploading..."   : "Processing..."}
            </>
          ) : (
            <>
              <UploadIcon size={16} />
              Process Statement
            </>
          )}
        </button>

        {/* View transactions link after success */}
        {result && (
          <button
            onClick={() => navigate("/transactions")}
            className="mt-3 w-full py-3 px-6 rounded-xl font-medium text-sm
                       border border-blue-500/30 text-blue-400
                       hover:bg-blue-500/10 transition-colors"
          >
            View Transactions →
          </button>
        )}

        {/* Supported banks note */}
        <div className="mt-8 rounded-xl border border-slate-800
                        bg-slate-900/50 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase
                        tracking-wider mb-3">
            Supported Banks
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["SBI", "HDFC", "ICICI", "Axis Bank"].map((bank) => (
              <div key={bank}
                   className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {bank}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Toast */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}