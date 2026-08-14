"use client";

import { MapPin, Navigation } from "lucide-react";
import { haversineDistance, formatDistance, confidenceColor } from "@/lib/geo-utils";
import type { MapDetection } from "@/types";

/**
 * Panel showing nearest elephant detections relative to the user's location.
 * Sorted by distance, with click-to-focus capability.
 */

interface NearestDetectionsPanelProps {
  detections: MapDetection[];
  userLat: number;
  userLng: number;
  onSelect: (detection: MapDetection) => void;
  maxItems?: number;
}

interface DetectionWithDistance {
  detection: MapDetection;
  distance: number;
}

export default function NearestDetectionsPanel({
  detections,
  userLat,
  userLng,
  onSelect,
  maxItems = 10,
}: NearestDetectionsPanelProps) {
  const detectionsWithDistance: DetectionWithDistance[] = detections
    .map((detection) => ({
      detection,
      distance: haversineDistance(
        userLat,
        userLng,
        detection.latitude,
        detection.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxItems);

  if (detectionsWithDistance.length === 0) {
    return (
      <div className="rounded-lg border border-[rgba(240,233,217,0.14)] p-4 text-center">
        <p className="text-xs text-[rgba(240,233,217,0.55)]">No detections available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-1">
        <Navigation className="h-3.5 w-3.5 text-accent-400" />
        <span className="text-xs font-semibold text-night-text">
          Nearest Detections
        </span>
      </div>
      {detectionsWithDistance.map(({ detection, distance }) => (
        <button
          key={detection.id}
          onClick={() => onSelect(detection)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-[rgba(240,233,217,0.14)] p-2.5 text-left hover:border-sage-300 hover:bg-[rgba(240,233,217,0.10)]/50 transition-colors"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: confidenceColor(detection.confidence) }}
          >
            {detection.elephantCount}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-night-text">
              {detection.imageName}
            </p>
            <p className="text-[10px] text-[rgba(240,233,217,0.55)]">
              {new Date(detection.detectedAt).toLocaleDateString()} ·{" "}
              {(detection.confidence * 100).toFixed(0)}% conf.
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <MapPin className="h-3 w-3 text-[rgba(240,233,217,0.55)]" />
            <span className="text-xs font-medium text-accent-400 tabular-nums">
              {formatDistance(distance)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
