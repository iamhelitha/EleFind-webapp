"use client";

import { useSession } from "next-auth/react";
import { Plus, PenTool } from "lucide-react";
import Badge, { riskVariant } from "@/components/ui/Badge";
import ConfirmButton from "@/components/ui/ConfirmButton";
import type { CrossingZone } from "@/types";

/**
 * Crossing zone list panel for the map sidebar.
 * Includes zone selection, drawing mode toggle, and add zone functionality.
 */

interface CrossingZonesPanelProps {
  zones: CrossingZone[];
  selectedZoneId: string | null;
  onSelectZone: (zone: CrossingZone) => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
  onAddZone: () => void;
}

export default function CrossingZonesPanel({
  zones,
  selectedZoneId,
  onSelectZone,
  isDrawingMode,
  onToggleDrawing,
  onAddZone,
}: CrossingZonesPanelProps) {
  const { data: session } = useSession();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-green-900">
          Crossing Zones ({zones.length})
        </span>
        {session?.user && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleDrawing}
              className={`
                flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors
                ${isDrawingMode
                  ? "bg-amber-500 text-white"
                  : "border border-card-border text-muted hover:border-green-300 hover:text-green-700"
                }
              `}
            >
              <PenTool className="h-3 w-3" />
              {isDrawingMode ? "Cancel" : "Draw"}
            </button>
            <button
              onClick={onAddZone}
              className="flex items-center gap-1 rounded-md bg-green-700 px-2 py-1 text-[10px] font-semibold text-white hover:bg-green-800 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        )}
      </div>

      {zones.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-card-border p-4 text-center">
          <p className="text-xs text-muted">No crossing zones mapped yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`
                rounded-lg border p-2.5 transition-all
                ${
                  selectedZoneId === zone.id
                    ? "border-green-500 bg-green-50/50 ring-1 ring-green-500"
                    : "border-card-border hover:border-green-300 hover:bg-green-50/30"
                }
              `}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectZone(zone)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectZone(zone); }}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-green-900">
                      {zone.name}
                    </p>
                    {zone.description && (
                      <p className="mt-0.5 text-[10px] text-muted line-clamp-1">
                        {zone.description}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted">
                      {new Date(zone.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={riskVariant[zone.riskLevel]} className="text-[10px] shrink-0">
                    {zone.riskLevel}
                  </Badge>
                </div>
              </div>
              <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                <ConfirmButton
                  id={zone.id}
                  type="zone"
                  initialCount={zone.confirmationCount ?? 0}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
