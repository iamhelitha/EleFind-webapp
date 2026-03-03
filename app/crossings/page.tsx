"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import Badge, { riskVariant } from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { MOCK_CROSSINGS } from "@/lib/mock-data";
import type { CrossingZone, MapFilters } from "@/types";

/**
 * Crossing zones management page.
 *
 * Split view:
 *  - Left: Map showing crossing zone polygons
 *  - Right: Zone list with risk badges
 *
 * For the demo phase, draw tools are not included.
 * Officers will be able to create/edit zones once auth is integrated.
 */

const EleMap = dynamic(() => import("@/components/map/EleMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-green-100/20">
      <Spinner size="lg" />
    </div>
  ),
});

const MAP_FILTERS: MapFilters = {
  showDetections: false,
  showCrossingZones: true,
  minConfidence: 0,
  dateFrom: null,
  dateTo: null,
};

export default function CrossingsPage() {
  const [selected, setSelected] = useState<CrossingZone | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-green-900 sm:text-3xl">
          Elephant Crossing Zones
        </h1>
        <p className="mt-1 text-sm text-muted">
          Known elephant crossing areas with risk-level classification. Wildlife officers can define new zones once authentication is enabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map — takes 3/5 */}
        <div className="lg:col-span-3 h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-card-border">
          <EleMap
            detections={[]}
            crossingZones={MOCK_CROSSINGS}
            filters={MAP_FILTERS}
          />
        </div>

        {/* Zone list — takes 2/5 */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-heading text-lg font-bold text-green-900">
            Zones ({MOCK_CROSSINGS.length})
          </h2>

          {MOCK_CROSSINGS.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-card-border p-8 text-center">
              <p className="text-sm text-muted">No crossing zones mapped yet.</p>
            </div>
          ) : (
            MOCK_CROSSINGS.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelected(zone)}
                className="w-full text-left"
              >
                <Card
                  className={`p-4 transition-all cursor-pointer ${
                    selected?.id === zone.id
                      ? "ring-2 ring-green-500"
                      : "hover:border-green-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-bold text-green-900">
                        {zone.name}
                      </p>
                      {zone.description && (
                        <p className="mt-1 text-xs text-muted line-clamp-2">
                          {zone.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        Created {new Date(zone.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={riskVariant[zone.riskLevel]}>
                      {zone.riskLevel}
                    </Badge>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
