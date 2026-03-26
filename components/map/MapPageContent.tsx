"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { Activity, MapPin, SlidersHorizontal } from "lucide-react";

import InfoPanel from "./panels/InfoPanel";
import LayerToggle from "./controls/LayerToggle";
import ConfidenceSlider from "./controls/ConfidenceSlider";
import Legend from "./controls/Legend";
import MetricsCard from "./controls/MetricsCard";
import UserLocationButton from "./controls/UserLocationButton";
import NearestDetectionsPanel from "./panels/NearestDetectionsPanel";
import CrossingZonesPanel from "./panels/CrossingZonesPanel";
import AddZoneModal from "@/components/crossings/AddZoneModal";
import Spinner from "@/components/ui/Spinner";
import type { MapDetection, CrossingZone, MapFilters } from "@/types";

/**
 * Main map page client component with 2-column layout.
 *
 * Layout:
 *  [Map (full width)] | [Right Sidebar (Controls + Zones + Nearby)]
 *
 * Responsive:
 *  - Desktop: Map + collapsible right sidebar
 *  - Mobile: Map primary, sidebar as slide-over panel
 */

interface MapPageContentProps {
  initialDetections: MapDetection[];
  initialCrossings: CrossingZone[];
}

const EleMap = dynamic(() => import("@/components/map/EleMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-green-100/20">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Loading map...</p>
      </div>
    </div>
  ),
});

function getDefaultFilters(): MapFilters {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  return {
    showDetections: true,
    showCrossingZones: true,
    minConfidence: 0,
    dateFrom: oneYearAgo.toISOString().split("T")[0],
    dateTo: now.toISOString().split("T")[0],
  };
}

export default function MapPageContent({
  initialDetections,
  initialCrossings,
}: MapPageContentProps) {
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile panel state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<MapFilters>(getDefaultFilters);

  // Data state
  const [crossingZones, setCrossingZones] = useState<CrossingZone[]>(initialCrossings);

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Crossing zone management state
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSON.Polygon | null>(null);

  // Focus state
  const [focusBoundary, setFocusBoundary] = useState<[number, number][] | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ lat: number; lng: number } | null>(null);

  // Handlers
  const updateFilter = (patch: Partial<MapFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setFocusPoint({ lat, lng });
    toast.success("Location found!");
  }, []);

  const handleLocationError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const handleSelectZone = useCallback((zone: CrossingZone) => {
    setSelectedZoneId(zone.id);
    setFocusBoundary(zone.boundary);
    setFocusPoint(null);
    setMobileOpen(false);
  }, []);

  const handleSelectDetection = useCallback((detection: MapDetection) => {
    setFocusPoint({ lat: detection.latitude, lng: detection.longitude });
    setFocusBoundary(null);
    setMobileOpen(false);
  }, []);

  const handleZoneDrawn = useCallback((polygon: GeoJSON.Polygon) => {
    setIsDrawingMode(false);
    setDrawnPolygon(polygon);
    setShowAddModal(true);
  }, []);

  const handleZoneCreated = useCallback((newZone: CrossingZone) => {
    setCrossingZones((prev) => [newZone, ...prev]);
    setDrawnPolygon(null);
    setShowAddModal(false);
    toast.success(`Zone "${newZone.name}" created!`);
  }, []);

  const handleAddZoneClick = useCallback(() => {
    setDrawnPolygon(null);
    setShowAddModal(true);
  }, []);

  // Metrics
  const totalDetections = initialDetections.length;
  const totalElephants = initialDetections.reduce(
    (sum, d) => sum + d.elephantCount,
    0
  );
  const avgConfidence =
    totalDetections > 0
      ? initialDetections.reduce((sum, d) => sum + d.confidence, 0) / totalDetections
      : 0;

  const sidebarContent = (
    <SidebarContent
      filters={filters}
      updateFilter={updateFilter}
      detectionCount={totalDetections}
      zoneCount={crossingZones.length}
      totalDetections={totalDetections}
      totalElephants={totalElephants}
      avgConfidence={avgConfidence}
      userLocation={userLocation}
      onLocationFound={handleLocationFound}
      onLocationError={handleLocationError}
      crossingZones={crossingZones}
      selectedZoneId={selectedZoneId}
      onSelectZone={handleSelectZone}
      isDrawingMode={isDrawingMode}
      onToggleDrawing={() => setIsDrawingMode((v) => !v)}
      onAddZone={handleAddZoneClick}
      detections={initialDetections}
      onSelectDetection={handleSelectDetection}
    />
  );

  return (
    <div className="relative flex" style={{ height: "calc(100vh - 4rem)" }}>
      {/* ── Mobile toggle button (visible < md) ── */}
      <div className="absolute top-3 right-3 z-[1000] md:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={`
            flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-md transition-colors
            ${mobileOpen ? "bg-green-700 text-white" : "bg-card-bg text-green-900 border border-card-border"}
          `}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Panel
        </button>
      </div>

      {/* ── Mobile slide-over panel ── */}
      {mobileOpen && (
        <div
          className="absolute inset-0 z-[999] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute top-0 bottom-0 right-0 w-80 max-w-[85vw] bg-card-bg shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 space-y-3">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* ── Map (takes remaining space) ── */}
      <div className="flex-1 relative">
        <EleMap
          detections={initialDetections}
          crossingZones={crossingZones}
          filters={filters}
          userLocation={userLocation}
          drawingEnabled={isDrawingMode}
          onZoneDrawn={handleZoneDrawn}
          focusBoundary={focusBoundary}
          focusPoint={focusPoint}
        />

        {/* Drawing mode indicator */}
        {isDrawingMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none">
            Click and drag to draw a rectangle zone
          </div>
        )}
      </div>

      {/* ── Right Sidebar (desktop) ── */}
      <div className="hidden md:flex">
        <InfoPanel
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          title="Map Panel"
        >
          {sidebarContent}
        </InfoPanel>
      </div>

      {/* ── Add Zone Modal ── */}
      {showAddModal && (
        <AddZoneModal
          polygon={drawnPolygon ?? undefined}
          onSuccess={handleZoneCreated}
          onClose={() => {
            setShowAddModal(false);
            setDrawnPolygon(null);
          }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/*  Unified sidebar content                                            */
/* ================================================================== */

interface SidebarContentProps {
  filters: MapFilters;
  updateFilter: (patch: Partial<MapFilters>) => void;
  detectionCount: number;
  zoneCount: number;
  totalDetections: number;
  totalElephants: number;
  avgConfidence: number;
  userLocation: { lat: number; lng: number } | null;
  onLocationFound: (lat: number, lng: number) => void;
  onLocationError: (message: string) => void;
  crossingZones: CrossingZone[];
  selectedZoneId: string | null;
  onSelectZone: (zone: CrossingZone) => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
  onAddZone: () => void;
  detections: MapDetection[];
  onSelectDetection: (detection: MapDetection) => void;
}

function SidebarContent({
  filters,
  updateFilter,
  detectionCount,
  zoneCount,
  totalDetections,
  totalElephants,
  avgConfidence,
  userLocation,
  onLocationFound,
  onLocationError,
  crossingZones,
  selectedZoneId,
  onSelectZone,
  isDrawingMode,
  onToggleDrawing,
  onAddZone,
  detections,
  onSelectDetection,
}: SidebarContentProps) {
  return (
    <>
      {/* My Location */}
      <UserLocationButton
        onLocationFound={onLocationFound}
        onError={onLocationError}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricsCard
          label="Detections"
          value={totalDetections}
          icon={<MapPin className="h-3.5 w-3.5" />}
        />
        <MetricsCard
          label="Elephants"
          value={totalElephants}
          icon={<Activity className="h-3.5 w-3.5" />}
        />
      </div>
      <MetricsCard
        label="Avg. Confidence"
        value={`${(avgConfidence * 100).toFixed(1)}%`}
      />

      {/* Separator */}
      <div className="border-t border-card-border" />

      {/* Layer toggles */}
      <div>
        <h4 className="text-xs font-semibold text-green-900 mb-1 px-1">Layers</h4>
        <LayerToggle
          label="Detections"
          enabled={filters.showDetections}
          onToggle={() => updateFilter({ showDetections: !filters.showDetections })}
          color="#2d6a4f"
          count={detectionCount}
        />
        <LayerToggle
          label="Crossing Zones"
          enabled={filters.showCrossingZones}
          onToggle={() =>
            updateFilter({ showCrossingZones: !filters.showCrossingZones })
          }
          color="#f4a261"
          count={zoneCount}
        />
      </div>

      {/* Confidence slider */}
      <ConfidenceSlider
        value={filters.minConfidence}
        onChange={(v) => updateFilter({ minConfidence: v })}
      />

      {/* Date filters */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-green-900 px-1">Date Range</h4>
        <div className="px-1 space-y-1.5">
          <label className="block">
            <span className="text-[10px] text-muted">From</span>
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                updateFilter({ dateFrom: e.target.value || null })
              }
              className="w-full rounded-md border border-card-border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </label>
          <label className="block">
            <span className="text-[10px] text-muted">To</span>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) =>
                updateFilter({ dateTo: e.target.value || null })
              }
              className="w-full rounded-md border border-card-border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </label>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-card-border" />

      {/* Legend */}
      <Legend
        showDetections={filters.showDetections}
        showZones={filters.showCrossingZones}
      />

      {/* Separator */}
      <div className="border-t border-card-border" />

      {/* Nearest detections (only when user location is available) */}
      {userLocation && (
        <>
          <NearestDetectionsPanel
            detections={detections}
            userLat={userLocation.lat}
            userLng={userLocation.lng}
            onSelect={onSelectDetection}
          />
          <div className="border-t border-card-border" />
        </>
      )}

      {/* Crossing zones */}
      <CrossingZonesPanel
        zones={crossingZones}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        isDrawingMode={isDrawingMode}
        onToggleDrawing={onToggleDrawing}
        onAddZone={onAddZone}
      />
    </>
  );
}
