"use client";

import { Polygon, Popup } from "react-leaflet";
import Badge, { riskVariant } from "@/components/ui/Badge";
import { RISK_COLORS } from "@/lib/geo-utils";
import ConfirmButton from "@/components/ui/ConfirmButton";
import type { CrossingZone } from "@/types";

/**
 * Polygon overlay for an elephant crossing zone.
 * Colour-coded by risk level, with confirmation button in popup.
 */

interface CrossingZoneLayerProps {
  zone: CrossingZone;
}

export default function CrossingZoneLayer({ zone }: CrossingZoneLayerProps) {
  const color = RISK_COLORS[zone.riskLevel];

  return (
    <Polygon
      positions={zone.boundary}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 2,
      }}
    >
      <Popup>
        <div className="min-w-[180px] text-sm space-y-1">
          <p className="font-bold text-green-900">{zone.name}</p>
          {zone.description && (
            <p className="text-muted">{zone.description}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={riskVariant[zone.riskLevel]}>
              {zone.riskLevel} RISK
            </Badge>
          </div>
          <div className="pt-1">
            <ConfirmButton
              id={zone.id}
              type="zone"
              initialCount={zone.confirmationCount ?? 0}
              size="sm"
            />
          </div>
        </div>
      </Popup>
    </Polygon>
  );
}
