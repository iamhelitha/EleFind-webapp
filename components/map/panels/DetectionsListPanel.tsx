"use client";

import { MapPin } from "lucide-react";
import { confidenceColor, formatLatLng } from "@/lib/geo-utils";
import type { MapDetection } from "@/types";

/**
 * Scrollable list of all elephant detections in the sidebar.
 * Clicking any row flies the map to that detection.
 */

interface DetectionsListPanelProps {
  detections: MapDetection[];
  selectedId: string | null;
  onSelect: (detection: MapDetection) => void;
}

export default function DetectionsListPanel({
  detections,
  selectedId,
  onSelect,
}: DetectionsListPanelProps) {
  const sorted = [...detections].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <MapPin className="h-3.5 w-3.5 text-green-700" />
        <span className="text-xs font-semibold text-green-900">
          Detections ({detections.length})
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-card-border p-4 text-center">
          <p className="text-xs text-muted">No detections recorded yet.</p>
          <p className="text-[10px] text-muted mt-0.5">
            Run detection on a geotagged image to see results here.
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
          {sorted.map((detection) => {
            const isSelected = detection.id === selectedId;
            const color = confidenceColor(detection.confidence);
            return (
              <button
                key={detection.id}
                onClick={() => onSelect(detection)}
                className={`
                  flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all
                  ${isSelected
                    ? "border-green-500 bg-green-50/60 ring-1 ring-green-400"
                    : "border-card-border hover:border-green-300 hover:bg-green-50/40"
                  }
                `}
              >
                {/* Confidence-coloured count badge */}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {detection.elephantCount}
                </span>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-green-900">
                    {detection.imageName}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(detection.detectedAt).toLocaleDateString()} ·{" "}
                    {(detection.confidence * 100).toFixed(0)}% conf.
                  </p>
                  <p className="text-[10px] text-muted/70 tabular-nums">
                    {formatLatLng(detection.latitude, detection.longitude)}
                  </p>
                </div>

                {/* Fly-to icon */}
                <MapPin
                  className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    isSelected ? "text-green-600" : "text-muted"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
