"use client";

import { Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import type { MapFilters } from "@/types";

/**
 * Floating sidebar panel with layer toggles and filter controls
 * for the interactive map page.
 */

interface MapControlsProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function MapControls({
  filters,
  onChange,
  collapsed,
  onToggleCollapse,
}: MapControlsProps) {
  const update = (patch: Partial<MapFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="mb-2 flex items-center gap-1.5 rounded-lg bg-[rgba(25,29,22,0.92)] backdrop-blur-md px-3 py-2 text-sm font-medium text-night-text shadow-md hover:bg-[rgba(25,29,22,0.92)] backdrop-blur-md transition-colors border border-[rgba(240,233,217,0.14)]"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {collapsed ? "Filters" : "Hide"}
      </button>

      {/* Controls panel */}
      {!collapsed && (
        <div className="w-64 rounded-xl bg-[rgba(25,29,22,0.92)] backdrop-blur-md border border-[rgba(240,233,217,0.14)] shadow-lg p-4 space-y-4 animate-fade-in">
          <h3 className="font-heading text-sm font-bold text-night-text">
            Map Layers
          </h3>

          {/* Layer toggles */}
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              onClick={() => update({ showDetections: !filters.showDetections })}
              className="text-accent-400"
            >
              {filters.showDetections ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-40" />}
            </button>
            <span className="text-sm">Detections</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <button
              onClick={() => update({ showCrossingZones: !filters.showCrossingZones })}
              className="text-accent-500"
            >
              {filters.showCrossingZones ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-40" />}
            </button>
            <span className="text-sm">Crossing Zones</span>
          </label>

          {/* Confidence filter */}
          <div>
            <label className="text-xs font-medium text-[rgba(240,233,217,0.55)] block mb-1">
              Min. Confidence: {(filters.minConfidence * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={filters.minConfidence}
              onChange={(e) => update({ minConfidence: parseFloat(e.target.value) })}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Legend */}
          <div className="border-t border-[rgba(240,233,217,0.14)] pt-3">
            <h4 className="text-xs font-medium text-[rgba(240,233,217,0.55)] mb-2">Legend</h4>
            <div className="space-y-1">
              {[
                { label: "High confidence (≥80%)", color: "#52b788" },
                { label: "Medium (60–80%)", color: "#f4a261" },
                { label: "Low (<60%)", color: "#e76f51" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-[rgba(240,233,217,0.55)]">
                  <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {[
                { label: "Low risk zone", color: "#52b788" },
                { label: "Medium risk", color: "#f4a261" },
                { label: "High risk", color: "#e76f51" },
                { label: "Critical", color: "#9b2226" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-[rgba(240,233,217,0.55)]">
                  <span
                    className="h-3 w-5 rounded-sm"
                    style={{ background: color, opacity: 0.4 }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
