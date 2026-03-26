"use client";

import { useState } from "react";
import { Navigation, Loader2 } from "lucide-react";

/**
 * Button to request browser geolocation and show user's position.
 */

interface UserLocationButtonProps {
  onLocationFound: (lat: number, lng: number) => void;
  onError?: (message: string) => void;
}

export default function UserLocationButton({
  onLocationFound,
  onError,
}: UserLocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  function handleClick() {
    if (!navigator.geolocation) {
      onError?.("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        setHasLocation(true);
        onLocationFound(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setLoading(false);
        let message = "Unable to get your location.";
        if (err.code === err.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable it in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out.";
        }
        onError?.(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium
        transition-colors disabled:opacity-60
        ${
          hasLocation
            ? "bg-green-100 text-green-900 border border-green-300"
            : "bg-green-700 text-white hover:bg-green-800"
        }
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
      {loading
        ? "Getting location..."
        : hasLocation
          ? "Location found"
          : "Show My Location"}
    </button>
  );
}
