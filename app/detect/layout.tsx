import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Detect Elephants in Aerial Images",
  description:
    "Upload geotagged aerial or drone imagery, run tiled AI elephant detection, and review confidence-scored results before mapping verified sightings.",
  path: "/detect",
  keywords: [
    "detect elephants in drone images",
    "aerial elephant detection",
    "wildlife image analysis",
    "AI elephant counter",
  ],
});

export default function DetectLayout({ children }: { children: ReactNode }) {
  return children;
}
