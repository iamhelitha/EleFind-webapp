/**
 * Shared TypeScript type definitions for EleFind.
 *
 * These types are used across components, API routes, and lib utilities
 * to ensure type-safe data flow throughout the application.
 */

/* ------------------------------------------------------------------ */
/*  Detection                                                          */
/* ------------------------------------------------------------------ */

/** Parameters sent to the Gradio inference endpoint via @gradio/client. */
export interface DetectionParams {
  image: Blob;
  confThreshold?: number;   // default 0.30
  sliceSize?: number;        // default 1024
  overlapRatio?: number;     // default 0.30
  iouThreshold?: number;     // default 0.40
}

/** Single bounding-box detection returned by the model. */
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  label: string;
}

/** Parsed result from a successful inference call. */
export interface DetectionResult {
  /** URL or object-URL for the annotated image (with bounding boxes drawn). */
  annotatedImageUrl: string | null;
  elephantCount: number;
  avgConfidence: number;
  maxConfidence: number;
  minConfidence: number;
  /** Human-readable summary of the SAHI parameters used. */
  paramsText: string;
  /** Per-detection confidence values, used for the bar chart. */
  confidences: number[];
  /** Raw table data: each row is [label, confidence, x1, y1, x2, y2]. */
  detectionTable: Array<Record<string, unknown>> | null;
}

/** Shape of the JSON returned by /api/detect to the frontend. */
export interface DetectionApiResponse {
  success: boolean;
  data?: DetectionResult;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Map & Geo                                                          */
/* ------------------------------------------------------------------ */

/** A single detection placed on the map. */
export interface MapDetection {
  id: string;
  latitude: number;
  longitude: number;
  elephantCount: number;
  confidence: number;
  imageName: string;
  detectedAt: string; // ISO date string
  thumbnailUrl?: string;
}

/** Risk level for an elephant crossing zone. */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Polygon coordinates for a crossing zone (array of [lat, lng] pairs). */
export type LatLngTuple = [number, number];

/** An elephant crossing zone displayed on the map. */
export interface CrossingZone {
  id: string;
  name: string;
  description?: string;
  riskLevel: RiskLevel;
  /** Polygon vertices as [lat, lng] pairs. */
  boundary: LatLngTuple[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  UI State                                                           */
/* ------------------------------------------------------------------ */

/** Possible states during the detection workflow. */
export type DetectionStatus =
  | "idle"
  | "uploading"
  | "connecting"
  | "detecting"
  | "processing"
  | "done"
  | "error";

/** Map filter state used in the sidebar controls. */
export interface MapFilters {
  showDetections: boolean;
  showCrossingZones: boolean;
  minConfidence: number;
  dateFrom: string | null;
  dateTo: string | null;
}
