/**
 * ProgressBar.jsx
 *
 * Shows upload + processing progress.
 * Two phases: uploading (0–100%) and processing.
 */

import { Loader2 } from "lucide-react";

export default function ProgressBar({ phase, uploadProgress }) {
  if (!phase) return null;

  return (
    <div className="mt-6 space-y-2">

      {/* Phase label */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 size={14} className="animate-spin text-blue-400" />
          <span>
            {phase === "uploading"   && "Uploading PDF..."}
            {phase === "processing"  && "Processing statement..."}
            {phase === "done"        && "Complete!"}
          </span>
        </div>

        {phase === "uploading" && (
          <span className="text-slate-400 text-sm font-mono">
            {uploadProgress}%
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{
            width:
              phase === "uploading"  ? `${uploadProgress}%` :
              phase === "processing" ? "100%"               :
              "100%",
            opacity: phase === "processing" ? 0.5 : 1,
            animation:
              phase === "processing"
                ? "pulse 1.5s ease-in-out infinite"
                : "none",
          }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 pt-1">
        {["Upload", "Process", "Done"].map((step, i) => {
          const active =
            (i === 0 && phase === "uploading")  ||
            (i === 1 && phase === "processing") ||
            (i === 2 && phase === "done");

          const completed =
            (i === 0 && (phase === "processing" || phase === "done")) ||
            (i === 1 && phase === "done");

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  completed ? "bg-green-400" :
                  active    ? "bg-blue-400"  :
                              "bg-slate-600"
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  completed ? "text-green-400" :
                  active    ? "text-blue-400"  :
                              "text-slate-600"
                }`}
              >
                {step}
              </span>
              {i < 2 && (
                <div className="w-6 h-px bg-slate-700 mx-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}