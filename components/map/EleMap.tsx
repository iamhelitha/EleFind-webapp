"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DetectionMarker from "./DetectionMarker";
import CrossingZoneLayer from "./CrossingZoneLayer";
import type { MapDetection, CrossingZone, MapFilters } from "@/types";

/**
 * Main interactive Leaflet map component.
 *
 * IMPORTANT: This component must be dynamically imported with
 * `next/dynamic` and `ssr: false` because Leaflet directly
 * accesses `window`, which is not available during SSR.
 *
 * Tile layer uses CartoDB Positron for a clean, conservation-
 * appropriate aesthetic.
 */

interface EleMapProps {
  detections: MapDetection[];
  crossingZones: CrossingZone[];
  filters: MapFilters;
  className?: string;
}

/** Centre of Sri Lanka — default map view. */
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

const CARTO_POSITRON =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export default function EleMap({
  detections,
  crossingZones,
  filters,
  className = "",
}: EleMapProps) {
  // Apply filters
  const visibleDetections = filters.showDetections
    ? detections.filter((d) => d.confidence >= filters.minConfidence)
    : [];

  const visibleZones = filters.showCrossingZones ? crossingZones : [];

  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`w-full h-full ${className}`}
      scrollWheelZoom={true}
    >
      <TileLayer url={CARTO_POSITRON} attribution={CARTO_ATTRIBUTION} />

      {/* Detection markers */}
      {visibleDetections.map((d) => (
        <DetectionMarker key={d.id} detection={d} />
      ))}

      {/* Crossing zone polygons */}
      {visibleZones.map((z) => (
        <CrossingZoneLayer key={z.id} zone={z} />
      ))}
    </MapContainer>
  );
}
