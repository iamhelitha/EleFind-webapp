import MapPageContent from "@/components/map/MapPageContent";
import { MOCK_DETECTIONS, MOCK_CROSSINGS } from "@/lib/mock-data";
import type { MapDetection, CrossingZone } from "@/types";

/**
 * Full-viewport interactive map page.
 *
 * This is a server component that fetches real data from the API.
 * The Leaflet map is loaded via `next/dynamic` with `ssr: false`
 * to avoid Leaflet's `window` access crashing SSR.
 */

export default async function MapPage() {
  let detections: MapDetection[] = MOCK_DETECTIONS;
  let crossings: CrossingZone[] = MOCK_CROSSINGS;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const [detectRes, crossRes] = await Promise.all([
      fetch(`${appUrl}/api/detections`, { cache: "no-store" }),
      fetch(`${appUrl}/api/crossings`, { cache: "no-store" }),
    ]);
    if (detectRes.ok) {
      detections = await detectRes.json();
    }
    if (crossRes.ok) {
      crossings = await crossRes.json();
    }
  } catch {
    console.warn("Could not fetch from DB, using mock data");
  }

  return (
    <MapPageContent
      initialDetections={detections}
      initialCrossings={crossings}
    />
  );
}
