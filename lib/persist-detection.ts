import pool from "./db";
import { extractCoordsFromExif } from "./geo";
import type { DetectionResult, SahiParams } from "@/types";

export async function persistDetectionAsync(
  file: File,
  result: DetectionResult,
  params: SahiParams
): Promise<void> {
  const buf = Buffer.from(await file.arrayBuffer());
  const coords = (await extractCoordsFromExif(buf)) ?? { lat: 0, lng: 0 };

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO detection_sessions (id, image_name, image_size, params)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, file.name, file.size, JSON.stringify(params)]
  );

  const detectionId = crypto.randomUUID();
  const sourceType = coords.lat === 0 ? "ungeoreferenced" : "drone";

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
      coords.lat,
      coords.lng,
      result.avgConfidence,
      result.elephantCount,
      JSON.stringify([0, 0, 1, 1]),
      sourceType,
      coords.lng,
      coords.lat,
    ]
  );
}
