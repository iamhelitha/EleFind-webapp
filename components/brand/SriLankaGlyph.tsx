/**
 * Stylised Sri Lanka outline used as ambient artwork behind the hero,
 * the auth split-screen and the map's empty state.
 *
 * The path is drawn directly in geographic coordinates (longitude, and
 * negated latitude so north is up), which is why the viewBox numbers look
 * unusual. Sample sighting coordinates therefore plot onto it as-is.
 */

/** Island outline, in (lon, -lat) space. */
const ISLAND_PATH =
  "M80.21,-9.83L80.55,-9.55L81.22,-8.55L81.4,-8.35L81.85,-7.7L81.87,-7L81.68,-6.45" +
  "L81.2,-6.2L80.6,-5.95L80.2,-6.04L79.98,-6.4L79.85,-6.93L79.82,-7.5L79.72,-8.05" +
  "L79.7,-8.5L79.98,-8.9L80,-9.3L79.87,-9.55L80.05,-9.78Z";

/** Protected-area blobs referenced by the map and hero artwork. */
const RESERVES = [
  { cx: 80.86, cy: -8.03, rx: 0.17, ry: 0.13 },
  { cx: 80.94, cy: -7.71, rx: 0.13, ry: 0.15 },
  { cx: 80.88, cy: -6.46, rx: 0.15, ry: 0.11 },
  { cx: 81.42, cy: -6.4, rx: 0.2, ry: 0.14 },
] as const;

/** Representative sighting pins, in the same (lon, -lat) space. */
const SIGHTINGS = [
  { cx: 80.7718, cy: -7.8731, r: 0.055 },
  { cx: 80.689, cy: -7.9456, r: 0.045 },
  { cx: 80.8234, cy: -8.0123, r: 0.06 },
  { cx: 80.5678, cy: -7.789, r: 0.04 },
  { cx: 80.9102, cy: -8.1001, r: 0.055 },
  { cx: 79.8612, cy: -6.9271, r: 0.04 },
] as const;

interface SriLankaGlyphProps {
  /** `light` sits on the sand ground; `night` sits on the ink ground. */
  tone?: "light" | "night";
  /** Draw the graticule behind the island. */
  showGrid?: boolean;
  /** Draw the sample sighting pins. */
  showSightings?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function SriLankaGlyph({
  tone = "night",
  showGrid = true,
  showSightings = true,
  className = "",
  style,
}: SriLankaGlyphProps) {
  const isNight = tone === "night";
  const gridStroke = isNight
    ? "rgba(240,233,217,.07)"
    : "rgba(32,30,29,.08)";
  const landFill = isNight ? "#1e2418" : "rgba(122,138,94,.16)";
  const landStroke = isNight ? "#5e6b48" : "#aebf92";

  return (
    <svg
      viewBox="79.5 -10.1 2.6 4.4"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {showGrid && (
        <g stroke={gridStroke} strokeWidth=".006">
          <path d="M79.4,-9.5H82.2M79.4,-9H82.2M79.4,-8.5H82.2M79.4,-8H82.2M79.4,-7.5H82.2M79.4,-7H82.2M79.4,-6.5H82.2M79.4,-6H82.2" />
          <path d="M79.75,-10.2V-5.7M80.25,-10.2V-5.7M80.75,-10.2V-5.7M81.25,-10.2V-5.7M81.75,-10.2V-5.7" />
        </g>
      )}

      <path
        d={ISLAND_PATH}
        fill={landFill}
        stroke={landStroke}
        strokeWidth={isNight ? 1.2 : 1.4}
        vectorEffect="non-scaling-stroke"
      />

      <g
        fill="rgba(122,138,94,.24)"
        stroke={isNight ? "rgba(174,191,146,.35)" : "none"}
        strokeWidth=".008"
      >
        {RESERVES.map((r) => (
          <ellipse key={`${r.cx}-${r.cy}`} {...r} />
        ))}
      </g>

      {showSightings && (
        <g fill="#f6a06b">
          {SIGHTINGS.map((s) => (
            <circle key={`${s.cx}-${s.cy}`} {...s} />
          ))}
        </g>
      )}
    </svg>
  );
}
