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
  { label: "High confidence (>=80%)", color: "#52b788", shape: "circle" },
  { label: "Medium (60-80%)", color: "#f4a261", shape: "circle" },
  { label: "Low (<60%)", color: "#e76f51", shape: "circle" },
];

const ZONE_LEGEND: LegendItem[] = [
  { label: "Low risk", color: "#52b788", shape: "rect" },
  { label: "Medium risk", color: "#f4a261", shape: "rect" },
  { label: "High risk", color: "#e76f51", shape: "rect" },
  { label: "Critical", color: "#9b2226", shape: "rect" },
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
      <h4 className="text-xs font-semibold text-green-900">Legend</h4>
      {showDetections && (
        <div className="space-y-1">
          {DETECTION_LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-muted">
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
            <div key={label} className="flex items-center gap-2 text-xs text-muted">
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
