"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/ui/Card";
import Badge, { riskVariant } from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import ConfirmButton from "@/components/ui/ConfirmButton";
import AddZoneModal from "@/components/crossings/AddZoneModal";
import { useAppAuth } from "@/components/providers/AuthProvider";
import type { CrossingZone, MapFilters } from "@/types";

interface CrossingsPageContentProps {
  initialCrossings: CrossingZone[];
}

const DrawableEleMap = dynamic(
  () => import("@/components/map/DrawableEleMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-green-100/20">
        <Spinner size="lg" />
      </div>
    ),
  }
);

const MAP_FILTERS: MapFilters = {
  showDetections: false,
  showCrossingZones: true,
  minConfidence: 0,
  dateFrom: null,
  dateTo: null,
};

export default function CrossingsPageContent({
  initialCrossings,
}: CrossingsPageContentProps) {
  const { user } = useAppAuth();
  const [zones, setZones] = useState<CrossingZone[]>(initialCrossings);
  const [selected, setSelected] = useState<CrossingZone | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSON.Polygon | null>(null);

  function handleZoneCreated(newZone: CrossingZone) {
    setZones((prev) => [newZone, ...prev]);
    setDrawnPolygon(null);
    setShowModal(false);
  }

  const handleZoneDrawn = useCallback((polygon: GeoJSON.Polygon) => {
    setIsDrawingMode(false);
    setDrawnPolygon(polygon);
    setShowModal(true);
  }, []);

  function handleAddZoneClick() {
    setDrawnPolygon(null);
    setShowModal(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-green-900 sm:text-3xl">
            Elephant Crossing Zones
          </h1>
          <p className="mt-1 text-sm text-muted">
            Known elephant crossing areas with risk-level classification.
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDrawingMode((v) => !v)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                isDrawingMode
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-green-700 text-green-700 hover:bg-green-50"
              }`}
            >
              {isDrawingMode ? "Cancel Draw" : "Draw Rectangle"}
            </button>
            <button
              onClick={handleAddZoneClick}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              + Add Zone
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map — takes 3/5 */}
        <div className="lg:col-span-3 relative">
          <div className="h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-card-border">
            <DrawableEleMap
              detections={[]}
              crossingZones={zones}
              filters={MAP_FILTERS}
              drawingEnabled={isDrawingMode}
              onZoneDrawn={handleZoneDrawn}
              focusBoundary={selected?.boundary ?? null}
            />
          </div>
          {isDrawingMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none">
              Click and drag on the map to draw a rectangle zone.
            </div>
          )}
        </div>

        {/* Zone list — takes 2/5 */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-heading text-lg font-bold text-green-900">
            Zones ({zones.length})
          </h2>

          {zones.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-card-border p-8 text-center">
              <p className="text-sm text-muted">No crossing zones mapped yet.</p>
            </div>
          ) : (
            zones.map((zone) => (
              <div key={zone.id}>
                <button
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
                <div className="px-1 mt-1.5">
                  <ConfirmButton
                    id={zone.id}
                    type="zone"
                    initialCount={zone.confirmationCount ?? 0}
                    size="sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <AddZoneModal
          polygon={drawnPolygon ?? undefined}
          onSuccess={handleZoneCreated}
          onClose={() => {
            setShowModal(false);
            setDrawnPolygon(null);
          }}
        />
      )}
    </div>
  );
}
