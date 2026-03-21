import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { MapDetection } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minConfidence = searchParams.get("minConfidence") ?? null;
    const dateFrom = searchParams.get("dateFrom") ?? null;
    const dateTo = searchParams.get("dateTo") ?? null;
    const limit = parseInt(searchParams.get("limit") ?? "200", 10);

    const { rows } = await pool.query(
      `SELECT id, image_name, lat, lng, confidence, elephant_count,
              bbox, source_type, confirmation_count, detected_at
       FROM detections
       WHERE ($1::float IS NULL OR confidence >= $1)
         AND ($2::timestamptz IS NULL OR detected_at >= $2)
         AND ($3::timestamptz IS NULL OR detected_at <= $3)
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
  } catch (error) {
    console.error("[detections GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch detections." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lat, lng, confidence, elephantCount, bbox, sourceType, sessionId } = body;

    if (lat == null || lng == null || confidence == null) {
      return NextResponse.json(
        { error: "lat, lng, and confidence are required." },
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
        lat,
        lng,
        confidence,
        elephantCount ?? 1,
        JSON.stringify(bbox ?? [0, 0, 1, 1]),
        sourceType ?? "drone",
        lng,
        lat,
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
  } catch (error) {
    console.error("[detections POST]", error);
    return NextResponse.json(
      { error: "Failed to create detection." },
      { status: 500 }
    );
  }
}
