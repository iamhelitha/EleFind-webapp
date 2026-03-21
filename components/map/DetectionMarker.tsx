"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapDetection } from "@/types";
import { confidenceColor, formatLatLng } from "@/lib/geo-utils";
import ConfirmButton from "@/components/ui/ConfirmButton";

/**
 * Map marker for an elephant detection.
 * Uses a custom circle icon coloured by confidence level.
 */

interface DetectionMarkerProps {
  detection: MapDetection;
}

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="
        width: 24px; height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700; color: white;
      ">🐘</div>
    `,
  });
}

export default function DetectionMarker({ detection }: DetectionMarkerProps) {
  const color = confidenceColor(detection.confidence);
  const icon = createIcon(color);

  return (
    <Marker
      position={[detection.latitude, detection.longitude]}
      icon={icon}
    >
      <Popup>
        <div className="min-w-[180px] text-sm space-y-1">
          <p className="font-bold text-green-900">
            {detection.elephantCount} elephant{detection.elephantCount > 1 ? "s" : ""}
          </p>
          <p className="text-muted">
            Confidence: <strong>{(detection.confidence * 100).toFixed(1)}%</strong>
          </p>
          <p className="text-muted">
            {formatLatLng(detection.latitude, detection.longitude)}
          </p>
          <p className="text-muted text-xs">
            {new Date(detection.detectedAt).toLocaleDateString()} &middot; {detection.imageName}
          </p>
          <div className="pt-1">
            <ConfirmButton
              id={detection.id}
              type="detection"
              initialCount={detection.confirmationCount ?? 0}
              size="sm"
            />
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
