"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Decorative Leaflet map displayed in the hero section background.
 *
 * Rendered non-interactive (no zoom/scroll) with a few pulsing
 * circle markers to hint at elephant detection locations.
 * Must be dynamically imported with ssr: false.
 */

/**
 * Offset the center significantly to the LEFT (lower longitude)
 * so that Sri Lanka appears on the RIGHT side of the hero viewport.
 * The text content occupies the left ~50%, so the map needs to
 * show the country in the right portion of the container.
 */
const SRI_LANKA_CENTER: [number, number] = [7.8731, 77.5];

const HINT_POINTS: [number, number][] = [
  [7.87, 80.77],
  [7.95, 80.69],
  [8.01, 80.82],
  [7.79, 80.57],
  [8.10, 80.91],
  [6.93, 79.86],
  [6.48, 80.88],
  [7.71, 80.94],
];

const CARTO_POSITRON =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export default function HeroMap() {
  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={8}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer url={CARTO_POSITRON} />
      {HINT_POINTS.map((pos, i) => (
        <CircleMarker
          key={i}
          center={pos}
          radius={6}
          pathOptions={{
            color: "#f4a261",
            fillColor: "#f4a261",
            fillOpacity: 0.6,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  );
}
