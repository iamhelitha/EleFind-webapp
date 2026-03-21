import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";
import type { CrossingZone } from "@/types";

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, description, risk_level, created_at
       FROM crossing_zones
       ORDER BY created_at DESC`
    );

    const zones: CrossingZone[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? undefined,
      riskLevel: (r.risk_level as string).toUpperCase() as CrossingZone["riskLevel"],
      boundary: [],
      createdAt: r.created_at,
    }));

    return NextResponse.json(zones);
  } catch (error) {
    console.error("[crossings GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch crossing zones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, riskLevel, polygonGeoJSON } = body;

    if (!name || !riskLevel || !polygonGeoJSON) {
      return NextResponse.json(
        { error: "name, riskLevel, and polygonGeoJSON are required." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const riskLevelDb = (riskLevel as string).toLowerCase();

    const { rows } = await pool.query(
      `INSERT INTO crossing_zones (id, name, description, risk_level, polygon)
       VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))
       RETURNING id, name, description, risk_level, created_at`,
      [id, name, description ?? null, riskLevelDb, JSON.stringify(polygonGeoJSON)]
    );

    const row = rows[0];
    const zone: CrossingZone = {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      riskLevel: (row.risk_level as string).toUpperCase() as CrossingZone["riskLevel"],
      boundary: [],
      createdAt: row.created_at,
    };

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error("[crossings POST]", error);
    return NextResponse.json(
      { error: "Failed to create crossing zone." },
      { status: 500 }
    );
  }
}
