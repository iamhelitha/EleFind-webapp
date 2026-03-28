"use client";

import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { MapDetection } from "@/types";
import { confidenceColor, formatLatLng } from "@/lib/geo-utils";
import ConfirmButton from "@/components/ui/ConfirmButton";

/**
 * Map marker for an elephant detection.
 *
 * Uses a Google Maps-style teardrop pin (SVG, fixed pixel size regardless of
 * zoom level). Clicking flies the map to zoom 15 centred on the detection.
 */

interface DetectionMarkerProps {
  detection: MapDetection;
}

/**
 * Build a Leaflet divIcon shaped like a teardrop pin.
 *
 * - 30 × 42 px — visible at every zoom level
 * - iconAnchor at bottom centre so the tip points at the exact coordinate
 * - popupAnchor above the tip so the popup doesn't overlap the pin
 * - White inner circle shows the elephant count
 */
function createIcon(color: string, count: number) {
  const label = count > 99 ? "99+" : String(count);
  const fontSize = count > 9 ? 7 : 9;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 42" width="30" height="42">
      <!-- Teardrop body — tip at (15, 42) -->
      <path
        d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27S30 25.5 30 15C30 6.716 23.284 0 15 0z"
        fill="${color}"
        stroke="white"
        stroke-width="2.5"
      />
      <!-- White inner circle -->
      <circle cx="15" cy="15" r="8" fill="white" opacity="0.92"/>
      <!-- Elephant count -->
      <text
        x="15" y="${15 + fontSize * 0.4}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="${fontSize}"
        font-weight="800"
        font-family="system-ui, sans-serif"
        fill="${color}"
      >${label}</text>
    </svg>
  `;

  return L.divIcon({
    className: "",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -44],
    html: svg,
  });
}

export default function DetectionMarker({ detection }: DetectionMarkerProps) {
  const map = useMap();
  const color = confidenceColor(detection.confidence);
  const icon = createIcon(color, detection.elephantCount);

  return (
    <Marker
      position={[detection.latitude, detection.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.flyTo([detection.latitude, detection.longitude], 15, { duration: 1.2 });
        },
      }}
    >
      <Popup>
        <div className="min-w-[180px] text-sm space-y-1">
          <p className="font-bold text-green-900">
            {detection.elephantCount} elephant{detection.elephantCount !== 1 ? "s" : ""}
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
