/**
 * Toast.jsx
 *
 * Simple toast notification component.
 * Shows success / error / info messages.
 *
 * Usage:
 *   const [toast, setToast] = useState(null);
 *   setToast({ type: "success", message: "Done!" });
 *   <Toast toast={toast} onClose={() => setToast(null)} />
 */

import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle size={20} className="text-green-400" />,
  error:   <XCircle    size={20} className="text-red-400"   />,
  info:    <Info       size={20} className="text-blue-400"  />,
};

const BG = {
  success: "border-green-500/30 bg-green-500/10",
  error:   "border-red-500/30   bg-red-500/10",
  info:    "border-blue-500/30  bg-blue-500/10",
};

const TEXT = {
  success: "text-green-300",
  error:   "text-red-300",
  info:    "text-blue-300",
};

export default function Toast({ toast, onClose }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const type = toast.type || "info";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border
                    shadow-xl backdrop-blur-sm max-w-sm
                    ${BG[type]}`}
      >
        <div className="mt-0.5 shrink-0">
          {ICONS[type]}
        </div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className={`text-sm font-semibold ${TEXT[type]}`}>
              {toast.title}
            </p>
          )}
          <p className="text-sm text-slate-300 mt-0.5 break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 text-slate-500 hover:text-slate-300
                     transition-colors mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}