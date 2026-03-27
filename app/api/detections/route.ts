import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { MapDetection } from "@/types";

const VALID_LAT = (v: number) => v >= -90 && v <= 90;
const VALID_LNG = (v: number) => v >= -180 && v <= 180;
const IS_GEOREFERENCED = (lat: number, lng: number) => !(lat === 0 && lng === 0);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minConfidence = searchParams.get("minConfidence") ?? null;
    const dateFrom = searchParams.get("dateFrom") ?? null;
    const dateTo = searchParams.get("dateTo") ?? null;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10), 500);

    const { rows } = await pool.query(
      `SELECT id, image_name, lat, lng, confidence, elephant_count,
              bbox, source_type, confirmation_count, detected_at
       FROM detections
       WHERE ($1::float IS NULL OR confidence >= $1)
         AND ($2::timestamptz IS NULL OR detected_at >= $2)
         AND ($3::timestamptz IS NULL OR detected_at <= $3)
         AND NOT (lat = 0 AND lng = 0)
       ORDER BY detected_at DESC
       LIMIT $4`,
      [minConfidence, dateFrom, dateTo, limit]
    );

    const detections: MapDetection[] = rows.map((r) => ({
      id: r.id,
      latitude: r.lat,
      longitude: r.lng,
      elephantCount: r.elephant_count,
      confidence: r.confidence,
      imageName: r.image_name ?? "",
      detectedAt: r.detected_at,
      confirmationCount: r.confirmation_count ?? 0,
    }));

    return NextResponse.json(detections);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch detections." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Require authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Rate limit: 20 detections per minute per user
  const userId = session.user.id ?? getClientIp(req);
  if (!rateLimit(`detections:post:${userId}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { lat, lng, confidence, elephantCount, bbox, sourceType, sessionId } = body;

    if (lat == null || lng == null || confidence == null) {
      return NextResponse.json(
        { error: "lat, lng, and confidence are required." },
        { status: 400 }
      );
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const confNum = Number(confidence);

    if (!VALID_LAT(latNum) || !VALID_LNG(lngNum)) {
      return NextResponse.json(
        { error: "lat must be -90..90 and lng must be -180..180." },
        { status: 400 }
      );
    }

    if (confNum < 0 || confNum > 1) {
      return NextResponse.json(
        { error: "confidence must be between 0 and 1." },
        { status: 400 }
      );
    }

    if (!IS_GEOREFERENCED(latNum, lngNum)) {
      return NextResponse.json(
        { error: "Coordinates (0, 0) are not valid for a detection." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const { rows } = await pool.query(
      `INSERT INTO detections
         (id, session_id, lat, lng, confidence, elephant_count, bbox, source_type, geom)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
         ST_SetSRID(ST_MakePoint($9, $10), 4326))
       RETURNING id, image_name, lat, lng, confidence, elephant_count,
                 bbox, source_type, detected_at`,
      [
        id,
        sessionId ?? null,
        latNum,
        lngNum,
        confNum,
        Math.max(0, parseInt(elephantCount ?? "1", 10)),
        JSON.stringify(bbox ?? [0, 0, 1, 1]),
        sourceType ?? "drone",
        lngNum,
        latNum,
      ]
    );

    const row = rows[0];
    const detection: MapDetection = {
      id: row.id,
      latitude: row.lat,
      longitude: row.lng,
      elephantCount: row.elephant_count,
      confidence: row.confidence,
      imageName: row.image_name ?? "",
      detectedAt: row.detected_at,
    };

    return NextResponse.json(detection, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create detection." },
      { status: 500 }
    );
  }
}
