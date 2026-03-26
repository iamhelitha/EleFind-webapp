import MapPageContent from "@/components/map/MapPageContent";
import { MOCK_DETECTIONS, MOCK_CROSSINGS } from "@/lib/mock-data";
import type { MapDetection, CrossingZone } from "@/types";

/**
 * Unified map page combining detections and crossing zones.
 *
 * Server component that fetches data, passes it to client-side
 * MapPageContent which handles the interactive 3-column layout.
 */

export default async function MapPage() {
  let detections: MapDetection[] = MOCK_DETECTIONS;
  let crossings: CrossingZone[] = MOCK_CROSSINGS;

  // Default: fetch only the last year of data
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const dateFrom = oneYearAgo.toISOString();

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const [detectRes, crossRes] = await Promise.all([
      fetch(`${appUrl}/api/detections?dateFrom=${dateFrom}`, { cache: "no-store" }),
      fetch(`${appUrl}/api/crossings`, { cache: "no-store" }),
    ]);
    if (detectRes.ok) {
      detections = await detectRes.json();
    }
    if (crossRes.ok) {
      crossings = await crossRes.json();
    }
  } catch {
    // Fall back to mock data silently
  }

  return (
    <MapPageContent
      initialDetections={detections}
      initialCrossings={crossings}
    />
  );
}
