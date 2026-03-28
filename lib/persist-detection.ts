import pool from "./db";
import { extractCoordsFromExif } from "./geo";
import type { DetectionResult, SahiParams } from "@/types";

/**
 * Persist a detection result that was produced by a direct browser → HF call.
 * Accepts pre-extracted GPS coordinates instead of reading EXIF from a File,
 * because the file never passes through the server in the browser-direct flow.
 *
 * @returns true if persisted, false if skipped (no valid location).
 */
export async function persistDetectionFromData({
  result,
  location,
  params,
  fileName,
  fileSize,
}: {
  result: DetectionResult;
  location: { lat: number; lng: number } | null;
  params: SahiParams;
  fileName: string;
  fileSize: number;
}): Promise<boolean> {
  const hasLocation =
    location !== null &&
    !(location.lat === 0 && location.lng === 0);

  if (!hasLocation) {
    return false;
  }

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO detection_sessions (id, image_name, image_size, params)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, fileName, fileSize, JSON.stringify(params)]
  );

  const detectionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO detections
       (id, session_id, image_name, lat, lng,
        confidence, elephant_count, bbox, source_type, geom)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
       ST_SetSRID(ST_MakePoint($10, $11), 4326))`,
    [
      detectionId,
      sessionId,
      fileName,
      location!.lat,
      location!.lng,
      result.avgConfidence,
      result.elephantCount,
      JSON.stringify([0, 0, 1, 1]),
      "drone",
      location!.lng,
      location!.lat,
    ]
  );

  return true;
}

/**
 * Persist a completed detection to the database.
 *
 * Only saves if the image contains valid GPS EXIF coordinates.
 * Ungeoreferenced images (no GPS data) are skipped entirely — there is
 * no value in storing a detection at (0, 0) and it would pollute the dataset.
 *
 * This function is intentionally fire-and-forget; call it with .catch() to
 * avoid unhandled promise rejection.
 *
 * @returns true if the detection was persisted, false if skipped.
 */
export async function persistDetectionAsync(
  file: File,
  result: DetectionResult,
  params: SahiParams
): Promise<boolean> {
  const buf = Buffer.from(await file.arrayBuffer());
  const coords = await extractCoordsFromExif(buf);

  // Skip images with no GPS data — don't pollute the DB with (0, 0) records
  const hasLocation =
    coords !== null &&
    !(coords.lat === 0 && coords.lng === 0);

  if (!hasLocation) {
    return false;
  }

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO detection_sessions (id, image_name, image_size, params)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, file.name, file.size, JSON.stringify(params)]
  );

  const detectionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO detections
       (id, session_id, image_name, lat, lng,
        confidence, elephant_count, bbox, source_type, geom)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
       ST_SetSRID(ST_MakePoint($10, $11), 4326))`,
    [
      detectionId,
      sessionId,
      file.name,
      coords!.lat,
      coords!.lng,
      result.avgConfidence,
      result.elephantCount,
      JSON.stringify([0, 0, 1, 1]),
      "drone",
      coords!.lng,
      coords!.lat,
    ]
  );

  return true;
}
