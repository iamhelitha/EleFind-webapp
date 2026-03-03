"use client";

import { Polygon, Popup } from "react-leaflet";
import Badge, { riskVariant } from "@/components/ui/Badge";
import { RISK_COLORS } from "@/lib/geo-utils";
import type { CrossingZone } from "@/types";

/**
 * Polygon overlay for an elephant crossing zone.
 * Colour-coded by risk level.
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
        <div className="min-w-[180px] text-sm">
          <p className="font-bold text-green-900">{zone.name}</p>
          {zone.description && (
            <p className="text-muted mt-1">{zone.description}</p>
          )}
          <div className="mt-2">
            <Badge variant={riskVariant[zone.riskLevel]}>
              {zone.riskLevel} RISK
            </Badge>
          </div>
        </div>
      </Popup>
    </Polygon>
  );
}
