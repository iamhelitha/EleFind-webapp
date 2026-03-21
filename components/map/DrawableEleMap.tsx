"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import DetectionMarker from "./DetectionMarker";
import CrossingZoneLayer from "./CrossingZoneLayer";
import type { MapDetection, CrossingZone, MapFilters } from "@/types";

/**
 * Extended map component for the crossings page.
 * Adds an optional Leaflet.Draw polygon control on top of EleMap.
 * EleMap.tsx is NOT modified — this component is used only on /crossings.
 */

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;
const CARTO_POSITRON =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

interface DrawControlProps {
  enabled: boolean;
  onZoneDrawn: (polygon: GeoJSON.Polygon) => void;
}

function DrawControl({ enabled, onZoneDrawn }: DrawControlProps) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // leaflet-draw augments L.Control with Draw — cast needed for TS
    const DrawControl = (L as unknown as { Control: { Draw: new (opts: unknown) => L.Control } })
      .Control.Draw;

    const drawControl = new DrawControl({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        rectangle: true,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    });

    map.addControl(drawControl);

    function onCreated(e: L.LeafletEvent) {
      const ev = e as unknown as { layer: L.Layer & { toGeoJSON(): GeoJSON.Feature } };
      const geometry = ev.layer.toGeoJSON().geometry as GeoJSON.Polygon;
      onZoneDrawn(geometry);
      // Don't add to drawnItems — user confirms via modal, not a duplicate layer
    }

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, enabled, onZoneDrawn]);

  return null;
}

interface DrawableEleMapProps {
  detections: MapDetection[];
  crossingZones: CrossingZone[];
  filters: MapFilters;
  className?: string;
  drawingEnabled: boolean;
  onZoneDrawn: (polygon: GeoJSON.Polygon) => void;
}

export default function DrawableEleMap({
  detections,
  crossingZones,
  filters,
  className = "",
  drawingEnabled,
  onZoneDrawn,
}: DrawableEleMapProps) {
  const visibleDetections = filters.showDetections
    ? detections.filter((d) => d.confidence >= filters.minConfidence)
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

      {visibleDetections.map((d) => (
        <DetectionMarker key={d.id} detection={d} />
      ))}

      {visibleZones.map((z) => (
        <CrossingZoneLayer key={z.id} zone={z} />
      ))}

      <DrawControl enabled={drawingEnabled} onZoneDrawn={onZoneDrawn} />
    </MapContainer>
  );
}
