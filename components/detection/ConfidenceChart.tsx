"use client";

/**
 * Simple horizontal bar chart showing per-detection confidence scores.
 * No external chart library needed — pure CSS bars.
 */

interface ConfidenceChartProps {
  confidences: number[];
}

export default function ConfidenceChart({ confidences }: ConfidenceChartProps) {
  return (
    <div className="space-y-2">
      {confidences.map((conf, i) => {
        const pct = Math.round(conf * 100);
        const color =
          pct >= 80 ? "bg-risk-low" : pct >= 60 ? "bg-amber-500" : "bg-risk-high";

        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted shrink-0">
              Detection {i + 1}
            </span>
            <div className="relative flex-1 h-5 rounded-full bg-green-100 overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs font-mono font-medium text-foreground">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
