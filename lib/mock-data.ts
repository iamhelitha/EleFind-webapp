/**
 * Mock detection and crossing-zone data for the demo phase.
 *
 * These will be replaced by real database queries once
 * PostgreSQL + PostGIS is set up.
 *
 * Locations are realistic coordinates in the Elephant Corridor
 * areas of Sri Lanka.
 */

import type { MapDetection, CrossingZone } from "@/types";

export const MOCK_DETECTIONS: MapDetection[] = [
  {
    id: "det-001",
    latitude: 7.8731,
    longitude: 80.7718,
    elephantCount: 3,
    confidence: 0.92,
    imageName: "drone_capture_001.jpg",
    detectedAt: "2025-12-15T08:30:00Z",
  },
  {
    id: "det-002",
    latitude: 7.9456,
    longitude: 80.6890,
    elephantCount: 1,
    confidence: 0.78,
    imageName: "survey_img_042.jpg",
    detectedAt: "2025-12-16T14:20:00Z",
  },
  {
    id: "det-003",
    latitude: 8.0123,
    longitude: 80.8234,
    elephantCount: 5,
    confidence: 0.87,
    imageName: "aerial_patrol_007.png",
    detectedAt: "2025-12-17T06:45:00Z",
  },
  {
    id: "det-004",
    latitude: 7.7890,
    longitude: 80.5678,
    elephantCount: 2,
    confidence: 0.65,
    imageName: "field_capture_019.jpg",
    detectedAt: "2025-12-18T16:10:00Z",
  },
  {
    id: "det-005",
    latitude: 8.1001,
    longitude: 80.9102,
    elephantCount: 4,
    confidence: 0.94,
    imageName: "drone_sweep_015.jpg",
    detectedAt: "2025-12-20T11:00:00Z",
  },
  {
    id: "det-006",
    latitude: 6.9271,
    longitude: 79.8612,
    elephantCount: 1,
    confidence: 0.71,
    imageName: "urban_edge_003.jpg",
    detectedAt: "2025-12-22T09:15:00Z",
  },
];

export const MOCK_CROSSINGS: CrossingZone[] = [
  {
    id: "cz-001",
    name: "Minneriya Corridor",
    description: "Major seasonal migration path near Minneriya National Park.",
    riskLevel: "HIGH",
    boundary: [
      [7.98, 80.78],
      [7.98, 80.84],
      [7.94, 80.84],
      [7.94, 80.78],
    ],
    createdAt: "2025-11-01T00:00:00Z",
  },
  {
    id: "cz-002",
    name: "Udawalawe Buffer",
    description: "Buffer zone between farmland and Udawalawe National Park.",
    riskLevel: "MEDIUM",
    boundary: [
      [6.48, 80.85],
      [6.48, 80.92],
      [6.44, 80.92],
      [6.44, 80.85],
    ],
    createdAt: "2025-11-15T00:00:00Z",
  },
  {
    id: "cz-003",
    name: "Wasgamuwa Approach",
    description: "Critical elephant approach road near Wasgamuwa.",
    riskLevel: "CRITICAL",
    boundary: [
      [7.71, 80.91],
      [7.71, 80.97],
      [7.67, 80.97],
      [7.67, 80.91],
    ],
    createdAt: "2025-12-01T00:00:00Z",
  },
];
