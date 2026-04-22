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
  const isProd = process.env.NODE_ENV === "production";
  let detections: MapDetection[] = isProd ? [] : MOCK_DETECTIONS;
  let crossings: CrossingZone[] = isProd ? [] : MOCK_CROSSINGS;

  // Default: fetch only the last year of data
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const dateFrom = oneYearAgo.toISOString();

  const serverBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  try {
    const [detectRes, crossRes] = await Promise.all([
      fetch(`${serverBaseUrl}/api/detections?dateFrom=${dateFrom}`, { cache: "no-store" }),
      fetch(`${serverBaseUrl}/api/crossings`, { cache: "no-store" }),
    ]);
    if (detectRes.ok) {
      detections = await detectRes.json();
    }
    if (crossRes.ok) {
      crossings = await crossRes.json();
    }
  } catch (error) {
    if (!isProd) {
      console.error("[map/page] Failed to load map data; using mock fallback.", error);
    }
  }

  return (
    <MapPageContent
      initialDetections={detections}
      initialCrossings={crossings}
    />
  );
}
