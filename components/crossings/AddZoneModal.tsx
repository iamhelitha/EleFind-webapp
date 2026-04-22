"use client";

import { useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { useAppAuth } from "@/components/providers/AuthProvider";
import type { CrossingZone } from "@/types";

interface AddZoneModalProps {
  /** Pre-drawn polygon from the map. If provided, coordinate textarea is hidden. */
  polygon?: GeoJSON.Polygon;
  onSuccess: (zone: CrossingZone) => void;
  onClose: () => void;
}

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

export default function AddZoneModal({ polygon, onSuccess, onClose }: AddZoneModalProps) {
  const { user } = useAppAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("medium");
  const [coordinates, setCoordinates] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
          <p className="text-sm text-muted mb-4">
            You must be logged in to add zones.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/login"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              Sign in
            </a>
            <button
              onClick={onClose}
              className="rounded-lg border border-card-border px-4 py-2 text-sm text-muted hover:border-green-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let polygonGeoJSON: GeoJSON.Polygon;

    if (polygon) {
      // Use the pre-drawn polygon from the map
      polygonGeoJSON = polygon;
    } else {
      // Parse the manual coordinate textarea
      const lines = coordinates
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 3) {
        setError("Enter at least 3 coordinate pairs.");
        return;
      }

      const pairs: [number, number][] = [];
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length !== 2) {
          setError(`Invalid coordinate: "${line}". Format: lat, lng`);
          return;
        }
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng)) {
          setError(`Non-numeric coordinate: "${line}"`);
          return;
        }
        pairs.push([lng, lat]); // GeoJSON: [lng, lat]
      }

      // Close polygon
      const first = pairs[0];
      const last = pairs[pairs.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        pairs.push([...first]);
      }

      polygonGeoJSON = { type: "Polygon", coordinates: [pairs] };
    }

    setLoading(true);
    try {
      const res = await fetch("/api/crossings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, riskLevel, polygonGeoJSON }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed.");
      }

      const newZone: CrossingZone = await res.json();
      onSuccess(newZone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  }

  // Count points from drawn polygon (ring minus the closing repeat)
  const drawnPointCount = polygon
    ? polygon.coordinates[0].length - 1
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-green-900">
            Add Crossing Zone
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-green-900 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Minneriya Corridor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full rounded-lg border border-card-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {RISK_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Polygon — pre-drawn or manual */}
          {drawnPointCount !== null ? (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              ✓ Zone drawn: <strong>{drawnPointCount} points</strong>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-green-900 mb-1">
                Coordinates <span className="text-red-500">*</span>
              </label>
              <textarea
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-card-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder={
                  "Enter one lat,lng pair per line. Minimum 3 points.\nExample:\n7.8731, 80.7718\n7.9731, 80.8718\n7.8731, 80.8718"
                }
              />
              <p className="mt-1 text-xs text-muted">
                Tip: Use the &ldquo;Draw Rectangle&rdquo; button on the map to draw a zone instead.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted hover:border-green-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Saving…
                </>
              ) : (
                "Create Zone"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
