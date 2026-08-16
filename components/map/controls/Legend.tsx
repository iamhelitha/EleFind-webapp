"use client";

/**
 * Color-coded legend for map markers and zones.
 */

interface LegendItem {
  label: string;
  color: string;
  shape?: "circle" | "rect";
}

const DETECTION_LEGEND: LegendItem[] = [
  { label: "High confidence (>=80%)", color: "#aebf92", shape: "circle" },
  { label: "Medium (60-80%)", color: "#f6a06b", shape: "circle" },
  { label: "Low (<60%)", color: "#d67f48", shape: "circle" },
];

const ZONE_LEGEND: LegendItem[] = [
  { label: "Low risk", color: "#aebf92", shape: "rect" },
  { label: "Medium risk", color: "#f6a06b", shape: "rect" },
  { label: "High risk", color: "#d67f48", shape: "rect" },
  { label: "Critical", color: "#c9503c", shape: "rect" },
];

interface LegendProps {
  showDetections?: boolean;
  showZones?: boolean;
}

export default function Legend({
  showDetections = true,
  showZones = true,
}: LegendProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-ink">Legend</h4>
      {showDetections && (
        <div className="space-y-1">
          {DETECTION_LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[rgba(32,30,29,0.55)]">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: color }}
              />
              {label}
            </div>
          ))}
        </div>
      )}
      {showZones && (
        <div className="space-y-1 mt-1.5">
          {ZONE_LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[rgba(32,30,29,0.55)]">
              <span
                className="h-2.5 w-4 rounded-sm shrink-0"
                style={{ background: color, opacity: 0.5 }}
              />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
