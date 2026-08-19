import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Community Elephant Sighting Alerts",
  description:
    "Preview EleFind's privacy-aware community alert workflow for verified elephant sightings and nearby crossing-zone activity.",
  path: "/alerts",
  keywords: [
    "elephant sighting alerts",
    "human elephant conflict alerts",
    "wildlife proximity alerts",
  ],
});

export default function AlertsLayout({ children }: { children: ReactNode }) {
  return children;
}
