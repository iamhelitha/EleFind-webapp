"use client";

/**
 * The "where you live" map on the alerts page.
 *
 * This is a static representation, not a real slippy map: the point is to
 * show the registered pin, the alert radius around it and nearby sightings.
 * The home pin renders snapped to a coarse grid, matching the privacy
 * promise made in the copy beside it — it is never the exact house.
 *
 * Swap this for a Leaflet view once the alert-area API exists; the props
 * are already shaped for that.
 */

interface AreaMapMockProps {
  /** Label shown top-left, e.g. "home · Hingurakgoda GN". */
  placeLabel: string;
  /** Selected alert radius in kilometres, drives the outer ring's size. */
  radiusKm: number;
}

/** Ring diameter as a percentage of the frame, per selectable radius. */
const RING_SCALE: Record<number, number> = {
  3: 26,
  5: 38,
  10: 56,
  20: 78,
};

export default function AreaMapMock({
  placeLabel,
  radiusKm,
}: AreaMapMockProps) {
  const outerRing = RING_SCALE[radiusKm] ?? 56;
  // The inner ring reads as the "core" area — always a little over half.
  const innerRing = outerRing * 0.54;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#1b2016]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 70% at 55% 45%, #232a1c, #141810)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(240,233,217,.07) 0 1px, transparent 1px 12.5%), repeating-linear-gradient(0deg, rgba(240,233,217,.07) 0 1px, transparent 1px 16.6%)",
        }}
      />

      {/* Protected-area blobs */}
      <div
        className="absolute left-[14%] top-[12%] h-[40%] w-[34%] border border-[rgba(174,191,146,.35)] bg-[rgba(122,138,94,.28)]"
        style={{ borderRadius: "40% 60% 55% 45%" }}
      />
      <div
        className="absolute bottom-[14%] right-[12%] h-[26%] w-[26%] border border-[rgba(174,191,146,.25)] bg-[rgba(122,138,94,.2)]"
        style={{ borderRadius: "60% 40% 50% 50%" }}
      />

      {/* Alert radius rings */}
      <div
        className="absolute left-[44%] top-[52%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-[rgba(174,191,146,.55)] bg-[rgba(174,191,146,.08)] transition-[width] duration-300"
        style={{ width: `${outerRing}%` }}
      />
      <div
        className="absolute left-[44%] top-[52%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[rgba(174,191,146,.7)] bg-[rgba(174,191,146,.12)] transition-[width] duration-300"
        style={{ width: `${innerRing}%` }}
      />

      {/* Home pin */}
      <div className="absolute left-[44%] top-[52%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-sage-600 bg-sand" />

      {/* Nearby sightings */}
      <div className="absolute left-[64%] top-[30%] h-[13px] w-[13px] rounded-full bg-accent-400" />
      <div className="absolute left-[74%] top-[44%] h-[10px] w-[10px] rounded-full bg-accent-300" />

      <span className="mono absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] text-white/80">
        {placeLabel}
      </span>
      <span className="mono absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] text-white/80">
        {radiusKm} km alert radius
      </span>
    </div>
  );
}
