import CrossingsPageContent from "@/components/crossings/CrossingsPageContent";
import { MOCK_CROSSINGS } from "@/lib/mock-data";
import type { CrossingZone } from "@/types";

/**
 * Crossing zones management page.
 *
 * This is a server component that fetches real crossing zone data from the API.
 *
 * Split view:
 *  - Left: Map showing crossing zone polygons
 *  - Right: Zone list with risk badges
 *
 * For the demo phase, draw tools are not included.
 * Officers will be able to create/edit zones once auth is integrated.
 */

export default async function CrossingsPage() {
  let crossings: CrossingZone[] = MOCK_CROSSINGS;

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/crossings`, { cache: "no-store" });
    if (res.ok) {
      crossings = await res.json();
    }
  } catch {
    console.warn("Could not fetch from DB, using mock data");
  }

  return (
    <CrossingsPageContent
      initialCrossings={crossings}
    />
  );
}
