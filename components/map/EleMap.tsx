"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import DetectionMarker from "./DetectionMarker";
import CrossingZoneLayer from "./CrossingZoneLayer";
import UserLocationMarker from "./overlays/UserLocationMarker";
import type { MapDetection, CrossingZone, MapFilters, LatLngTuple } from "@/types";

/**
 * Main interactive Leaflet map component.
 *
 * Supports detection markers, crossing zone polygons, user location,
 * optional zone drawing, and fly-to-bounds for selected zones.
 *
 * IMPORTANT: Must be dynamically imported with `next/dynamic` and
 * `ssr: false` because Leaflet directly accesses `window`.
 */

/** Maximum allowed side length for a crossing zone rectangle (metres). */
const MAX_ZONE_SIDE_M = 1_000; // 1 km

interface EleMapProps {
  detections: MapDetection[];
  crossingZones: CrossingZone[];
  filters: MapFilters;
  className?: string;
  /** User's geolocation */
  userLocation?: { lat: number; lng: number } | null;
  /** Drawing mode for creating crossing zones */
  drawingEnabled?: boolean;
  onZoneDrawn?: (polygon: GeoJSON.Polygon) => void;
  /** Called when the drawn rectangle exceeds the size limit */
  onDrawError?: (message: string) => void;
  /** Boundary to fly to (e.g. selected crossing zone) */
  focusBoundary?: LatLngTuple[] | null;
  /** Single point to fly to (e.g. selected detection) */
  focusPoint?: { lat: number; lng: number } | null;
}

/** Centre of Sri Lanka — default map view. */
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

const CARTO_POSITRON =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

/** Flies the map to given bounds when they change. */
function FlyToBounds({ boundary }: { boundary: LatLngTuple[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!boundary || boundary.length < 2) return;
    map.flyToBounds(boundary as L.LatLngBoundsExpression, {
      padding: [40, 40],
      maxZoom: 14,
    });
  }, [map, boundary]);
  return null;
}

/** Flies the map to a single point. */
function FlyToPoint({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1 });
  }, [map, lat, lng]);
  return null;
}

/** Leaflet Draw control for rectangle drawing with a size limit. */
function DrawControl({
  enabled,
  onZoneDrawn,
  onDrawError,
}: {
  enabled: boolean;
  onZoneDrawn: (polygon: GeoJSON.Polygon) => void;
  onDrawError?: (message: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const DrawCtrl = (
      L as unknown as {
        Control: { Draw: new (opts: unknown) => L.Control };
      }
    ).Control.Draw;

    const drawControl = new DrawCtrl({
      draw: {
        polygon: false,
        rectangle: { showArea: true },
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });

    map.addControl(drawControl);

    function onCreated(e: L.LeafletEvent) {
      const ev = e as unknown as {
        layer: L.Layer & {
          toGeoJSON(): GeoJSON.Feature;
          getBounds(): L.LatLngBounds;
        };
      };

      const bounds = ev.layer.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // Measure east-west width and north-south height in metres
      const widthM = sw.distanceTo(L.latLng(sw.lat, ne.lng));
      const heightM = sw.distanceTo(L.latLng(ne.lat, sw.lng));

      if (widthM > MAX_ZONE_SIDE_M || heightM > MAX_ZONE_SIDE_M) {
        // Discard the oversized shape and notify the user
        drawnItems.removeLayer(ev.layer);
        const wKm = (widthM / 1000).toFixed(1);
        const hKm = (heightM / 1000).toFixed(1);
        onDrawError?.(
          `Zone is too large (${wKm} × ${hKm} km). ` +
          `Maximum allowed size is ${MAX_ZONE_SIDE_M / 1000} × ${MAX_ZONE_SIDE_M / 1000} km.`
        );
        return;
      }

      // Add to feature group so the edit toolbar can manage it
      drawnItems.addLayer(ev.layer);

      const geometry = ev.layer.toGeoJSON().geometry as GeoJSON.Polygon;
      onZoneDrawn(geometry);
    }

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, enabled, onZoneDrawn, onDrawError]);

  return null;
}

export default function EleMap({
  detections,
  crossingZones,
  filters,
  className = "",
  userLocation,
  drawingEnabled = false,
  onZoneDrawn,
  onDrawError,
  focusBoundary = null,
  focusPoint = null,
}: EleMapProps) {
  // Apply filters
  const visibleDetections = filters.showDetections
    ? detections.filter((d) => {
        if (d.confidence < filters.minConfidence) return false;
        if (filters.dateFrom && d.detectedAt < filters.dateFrom) return false;
        if (filters.dateTo && d.detectedAt > filters.dateTo) return false;
        return true;
      })
    : [];

  const visibleZones = filters.showCrossingZones ? crossingZones : [];

  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`w-full h-full ${className}`}
      scrollWheelZoom={true}
    >
      <TileLayer url={CARTO_POSITRON} attribution={CARTO_ATTRIBUTION} />

      {/* Detection markers */}
      {visibleDetections.map((d) => (
        <DetectionMarker key={d.id} detection={d} />
      ))}

      {/* Crossing zone polygons */}
      {visibleZones.map((z) => (
        <CrossingZoneLayer key={z.id} zone={z} />
      ))}

      {/* User location */}
      {userLocation && (
        <UserLocationMarker
          latitude={userLocation.lat}
          longitude={userLocation.lng}
          flyTo={false}
        />
      )}

      {/* Drawing control */}
      {drawingEnabled && onZoneDrawn && (
        <DrawControl
          enabled={drawingEnabled}
          onZoneDrawn={onZoneDrawn}
          onDrawError={onDrawError}
        />
      )}

      {/* Focus handlers */}
      <FlyToBounds boundary={focusBoundary} />
      {focusPoint && <FlyToPoint lat={focusPoint.lat} lng={focusPoint.lng} />}
    </MapContainer>
  );
}
