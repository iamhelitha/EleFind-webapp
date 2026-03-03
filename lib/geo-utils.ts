/**
 * Coordinate conversion and geospatial utilities.
 *
 * Used for converting between coordinate formats and generating
 * GeoJSON for PostGIS storage.
 */

import type { RiskLevel } from "@/types";

/**
 * Risk-level colour map used consistently across map markers,
 * crossing zone polygons, and badges.
 */
export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "#52b788",
  MEDIUM: "#f4a261",
  HIGH: "#e76f51",
  CRITICAL: "#9b2226",
};

/**
 * Convert a confidence score (0–1) to a CSS colour string.
 * High confidence → green, low → red.
 */
export function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "#52b788";
  if (confidence >= 0.6) return "#f4a261";
  return "#e76f51";
}

/**
 * Format a lat/lng pair as a human-readable string.
 */
export function formatLatLng(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}
