"use client";

import { Marker, Popup, Circle, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import { formatLatLng } from "@/lib/geo-utils";

/**
 * Shows the user's current location on the map with a pulsing blue marker.
 */

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
  flyTo?: boolean;
}

const userIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `
    <div style="
      width: 20px; height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
});

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 12, { duration: 1.5 });
  }, [map, lat, lng]);
  return null;
}

export default function UserLocationMarker({
  latitude,
  longitude,
  flyTo = true,
}: UserLocationMarkerProps) {
  return (
    <>
      {flyTo && <FlyToLocation lat={latitude} lng={longitude} />}
      <Circle
        center={[latitude, longitude]}
        radius={500}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
          weight: 1,
        }}
      />
      <Marker position={[latitude, longitude]} icon={userIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-bold text-green-900">Your Location</p>
            <p className="text-muted text-xs mt-0.5">
              {formatLatLng(latitude, longitude)}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
