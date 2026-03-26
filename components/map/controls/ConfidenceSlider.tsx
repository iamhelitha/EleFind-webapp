"use client";

/**
 * Confidence threshold slider control.
 */

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ConfidenceSlider({
  value,
  onChange,
}: ConfidenceSliderProps) {
  return (
    <div className="px-1">
      <label className="flex items-center justify-between text-xs font-medium text-muted mb-1.5">
        <span>Min. Confidence</span>
        <span className="tabular-nums font-semibold text-green-900">
          {(value * 100).toFixed(0)}%
        </span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-green-700"
      />
    </div>
  );
}
