import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getServerAuthUserFromRequest } from "@/lib/server-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { CrossingZone } from "@/types";

const VALID_RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);

function validateGeoJSONPolygon(value: unknown): value is GeoJSON.Polygon {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  if (p.type !== "Polygon") return false;
  if (!Array.isArray(p.coordinates) || p.coordinates.length === 0) return false;
  const ring = p.coordinates[0];
  if (!Array.isArray(ring) || ring.length < 4) return false;
  return ring.every(
    (pt) =>
      Array.isArray(pt) &&
      pt.length >= 2 &&
      typeof pt[0] === "number" &&
      typeof pt[1] === "number" &&
      pt[0] >= -180 && pt[0] <= 180 &&
      pt[1] >= -90 && pt[1] <= 90
  );
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, risk_level, confirmation_count, created_at,
              ST_AsGeoJSON(polygon) AS polygon_geojson
       FROM crossing_zones
       ORDER BY created_at DESC`
    );

    const zones: CrossingZone[] = rows.map((r) => {
      let boundary: [number, number][] = [];
      if (r.polygon_geojson) {
        const geom = JSON.parse(r.polygon_geojson) as GeoJSON.Polygon;
        // GeoJSON coords are [lng, lat]; Leaflet expects [lat, lng]
        boundary = geom.coordinates[0].map(([lng, lat]) => [lat, lng]);
      }
      return {
        id: r.id,
        name: r.name,
        description: r.description ?? undefined,
        riskLevel: (r.risk_level as string).toUpperCase() as CrossingZone["riskLevel"],
        boundary,
        createdAt: r.created_at,
        confirmationCount: r.confirmation_count ?? 0,
      };
    });

    return NextResponse.json(zones);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch crossing zones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Only officers can create crossing zones
  const user = await getServerAuthUserFromRequest(req);
  if (!user || user.role !== "officer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Rate limit: 10 zone creations per minute per user
  const userId = user.id ?? getClientIp(req);
  if (!rateLimit(`crossings:post:${userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, description, riskLevel, polygonGeoJSON } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }

    if (!riskLevel || !VALID_RISK_LEVELS.has((riskLevel as string).toLowerCase())) {
      return NextResponse.json(
        { error: `riskLevel must be one of: ${[...VALID_RISK_LEVELS].join(", ")}.` },
        { status: 400 }
      );
    }

    if (!validateGeoJSONPolygon(polygonGeoJSON)) {
      return NextResponse.json(
        { error: "polygonGeoJSON must be a valid GeoJSON Polygon with at least 4 coordinate pairs." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const riskLevelDb = (riskLevel as string).toLowerCase();

    const { rows } = await pool.query(
      `INSERT INTO crossing_zones (id, name, description, risk_level, polygon)
       VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))
       RETURNING id, name, description, risk_level, created_at`,
      [id, name.trim(), description ?? null, riskLevelDb, JSON.stringify(polygonGeoJSON)]
    );

    const row = rows[0];
    const boundary: [number, number][] = (polygonGeoJSON as GeoJSON.Polygon)
      .coordinates[0].map((pos) => [pos[1], pos[0]] as [number, number]);

    const zone: CrossingZone = {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      riskLevel: (row.risk_level as string).toUpperCase() as CrossingZone["riskLevel"],
      boundary,
      createdAt: row.created_at,
    };

    return NextResponse.json(zone, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create crossing zone." },
      { status: 500 }
    );
  }
}
