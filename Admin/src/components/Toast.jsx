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

const SURFACE    = "#12161F";
const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const GREEN      = "#34D399";
const RED        = "#F87171";

const ICON_COLOR = {
  success: GREEN,
  error:   RED,
  info:    GOLD_SOFT,
};

const ICONS = {
  success: <CheckCircle size={20} style={{ color: GREEN }} />,
  error:   <XCircle    size={20} style={{ color: RED   }} />,
  info:    <Info       size={20} style={{ color: GOLD_SOFT }} />,
};

const BORDER_COLOR = {
  success: `${GREEN}4D`,
  error:   `${RED}4D`,
  info:    `${GOLD}4D`,
};

const BG_COLOR = {
  success: `${GREEN}14`,
  error:   `${RED}14`,
  info:    `${GOLD}14`,
};

const TITLE_COLOR = {
  success: GREEN,
  error:   RED,
  info:    GOLD_SOFT,
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
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm max-w-sm"
        style={{
          backgroundColor: BG_COLOR[type],
          borderColor: BORDER_COLOR[type],
          boxShadow: "0 16px 36px -20px rgba(0,0,0,0.6)",
        }}
      >
        <div className="mt-0.5 shrink-0">
          {ICONS[type]}
        </div>

        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold" style={{ color: TITLE_COLOR[type] }}>
              {toast.title}
            </p>
          )}
          <p className="text-sm mt-0.5 break-words" style={{ color: TEXT_DIM }}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 transition-colors duration-200 mt-0.5"
          style={{ color: TEXT_FAINT }}
          onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_DIM)}
          onMouseLeave={(e) => (e.currentTarget.style.color = TEXT_FAINT)}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}