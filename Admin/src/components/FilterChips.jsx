/**
 * FilterChips.jsx
 *
 * Shows active filters as dismissible chips above the table.
 * Clicking X on a chip removes that single filter.
 * Reset Filters button clears everything.
 */

import { X, SlidersHorizontal, RotateCcw } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2">

      {/* Active filter icon */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <SlidersHorizontal size={13} />
          <span>Filters:</span>
        </div>
      )}

      {/* Chips */}
      {chips.map((chip) => (
        <div
          key={chip.key}
          className="flex items-center gap-1.5 px-3 py-1
                     bg-blue-500/10 border border-blue-500/20
                     rounded-full text-xs text-blue-300"
        >
          <span className="text-blue-400/60">{chip.label}:</span>
          <span>{formatChipValue(chip.key, chip.value)}</span>
          <button
            onClick={() => onRemove(chip.key)}
            className="ml-0.5 text-blue-400/50 hover:text-blue-300
                       transition-colors"
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
          className="flex items-center gap-1 px-3 py-1
                     rounded-full text-xs
                     text-slate-400 hover:text-slate-200
                     border border-slate-700 hover:border-slate-500
                     transition-colors"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      )}

      {/* Result count */}
      {!loading && total > 0 && (
        <span className="ml-auto text-xs text-slate-500">
          {total} result{total !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}