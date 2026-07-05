/**
 * ProgressBar.jsx
 *
 * Shows upload + processing progress.
 * Two phases: uploading (0–100%) and processing.
 */

import { Loader2 } from "lucide-react";

const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const BORDER_SOFT= "#1B202B";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";

export default function ProgressBar({ phase, uploadProgress }) {
  if (!phase) return null;

  return (
    <div className="mt-6 space-y-2" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Phase label */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2" style={{ color: TEXT_DIM }}>
          <Loader2 size={14} className="animate-spin" style={{ color: GOLD_SOFT }} />
          <span>
            {phase === "uploading"   && "Uploading PDF..."}
            {phase === "processing"  && "Processing statement..."}
            {phase === "done"        && "Complete!"}
          </span>
        </div>

        {phase === "uploading" && (
          <span className="text-sm" style={{ color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>
            {uploadProgress}%
          </span>
        )}
      </div>

      {/* Bar */}
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: BORDER_SOFT }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width:
              phase === "uploading"  ? `${uploadProgress}%` :
              phase === "processing" ? "100%"               :
              "100%",
            backgroundColor: phase === "done" ? GREEN : GOLD,
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

          const dotColor = completed ? GREEN : active ? GOLD_SOFT : "#2A3040";
          const textColor = completed ? GREEN : active ? GOLD_SOFT : TEXT_FAINT;

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-colors duration-200"
                style={{ backgroundColor: dotColor }}
              />
              <span
                className="text-xs transition-colors duration-200"
                style={{ color: textColor }}
              >
                {step}
              </span>
              {i < 2 && (
                <div className="w-6 h-px mx-1" style={{ backgroundColor: BORDER_SOFT }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}