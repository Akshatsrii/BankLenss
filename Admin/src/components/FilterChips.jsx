/**
 * FilterChips.jsx
 *
 * Shows active filters as dismissible chips above the table.
 * Clicking X on a chip removes that single filter.
 * Reset Filters button clears everything.
 */

import { X, SlidersHorizontal, RotateCcw } from "lucide-react";

const GOLD       = "#C9A227";
const GOLD_SOFT  = "#D9B65A";
const BORDER_SOFT= "#1B202B";
const TEXT_DIM   = "#9AA1B2";
const TEXT_FAINT = "#5F6678";
const TEXT       = "#EDEFF3";

const TYPE_LABELS = {
  debit:  "Debit",
  credit: "Credit",
};

function formatChipValue(key, value) {
  if (key === "type")      return TYPE_LABELS[value] || value;
  if (key === "minAmount") return `≥ ₹${value}`;
  if (key === "maxAmount") return `≤ ₹${value}`;
  if (key === "from")      return `From ${value}`;
  if (key === "to")        return `To ${value}`;
  if (key === "search")    return `"${value}"`;
  return value;
}

export default function FilterChips({
  chips,
  onRemove,
  onReset,
  total,
  loading,
}) {
  if (chips.length === 0 && !loading) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Active filter icon */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: TEXT_FAINT }}>
          <SlidersHorizontal size={13} />
          <span>Filters:</span>
        </div>
      )}

      {/* Chips */}
      {chips.map((chip) => (
        <div
          key={chip.key}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors duration-200"
          style={{
            backgroundColor: `${GOLD}12`,
            border: `1px solid ${GOLD}30`,
            color: GOLD_SOFT,
          }}
        >
          <span style={{ color: `${GOLD_SOFT}99` }}>{chip.label}:</span>
          <span style={{ color: TEXT }}>{formatChipValue(chip.key, chip.value)}</span>
          <button
            onClick={() => onRemove(chip.key)}
            className="ml-0.5 transition-colors duration-200"
            style={{ color: `${GOLD_SOFT}80` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD_SOFT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${GOLD_SOFT}80`)}
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* Reset all button */}
      {chips.length > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors duration-200"
          style={{
            color: TEXT_FAINT,
            border: `1px solid ${BORDER_SOFT}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = TEXT_DIM;
            e.currentTarget.style.borderColor = "#2A3040";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = TEXT_FAINT;
            e.currentTarget.style.borderColor = BORDER_SOFT;
          }}
        >
          <RotateCcw size={11} />
          Reset
        </button>
      )}

      {/* Result count */}
      {!loading && total > 0 && (
        <span className="ml-auto text-xs" style={{ color: TEXT_FAINT }}>
          {total} result{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}