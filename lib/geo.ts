import exifr from "exifr";

export async function extractCoordsFromExif(
  buffer: Buffer
): Promise<{ lat: number; lng: number } | null> {
  try {
    const gps = await exifr.gps(buffer);
    if (!gps || gps.latitude == null || gps.longitude == null) return null;
    return { lat: gps.latitude, lng: gps.longitude };
  } catch {
    return null;
  }
}

/**
 * Approximates lat/lng from a normalised bbox [x1,y1,x2,y2] and an anchor
 * coordinate (e.g. from EXIF). Assumes ~120 m drone altitude.
 */
export function bboxCentreToLatLng(
  bbox: [number, number, number, number],
  anchorLat: number,
  anchorLng: number
): { lat: number; lng: number } {
  const cx = (bbox[0] + bbox[2]) / 2;
  const cy = (bbox[1] + bbox[3]) / 2;
  return {
    lat: anchorLat + (0.5 - cy) * 0.001,
    lng: anchorLng + (cx - 0.5) * 0.001,
  };
}

/**
 * Returns the centroid of a Sentinel-2 bounding box [west, south, east, north].
 */
export function sentinelBboxCentroid(
  bbox: [number, number, number, number]
): { lat: number; lng: number } {
  return {
    lat: (bbox[1] + bbox[3]) / 2,
    lng: (bbox[0] + bbox[2]) / 2,
  };
}
