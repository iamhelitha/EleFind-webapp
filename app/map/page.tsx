"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MapControls from "@/components/map/MapControls";
import Spinner from "@/components/ui/Spinner";
import { MOCK_DETECTIONS, MOCK_CROSSINGS } from "@/lib/mock-data";
import type { MapFilters } from "@/types";

/**
 * Full-viewport interactive map page.
 *
 * The Leaflet map is loaded via `next/dynamic` with `ssr: false`
 * to avoid Leaflet's `window` access crashing SSR.
 */

const EleMap = dynamic(() => import("@/components/map/EleMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-green-100/20">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Loading map…</p>
      </div>
    </div>
  ),
});

const DEFAULT_FILTERS: MapFilters = {
  showDetections: true,
  showCrossingZones: true,
  minConfidence: 0,
  dateFrom: null,
  dateTo: null,
};

export default function MapPage() {
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  return (
    <div className="relative" style={{ height: "calc(100vh - 4rem)" }}>
      <EleMap
        detections={MOCK_DETECTIONS}
        crossingZones={MOCK_CROSSINGS}
        filters={filters}
      />
      <MapControls
        filters={filters}
        onChange={setFilters}
        collapsed={controlsCollapsed}
        onToggleCollapse={() => setControlsCollapsed(!controlsCollapsed)}
      />
    </div>
  );
}
