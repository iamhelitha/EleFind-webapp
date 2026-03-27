import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { CrossingZone } from "@/types";

const VALID_RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only officers can edit crossing zones
  const session = await auth();
  if (!session?.user || session.user.role !== "officer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Rate limit: 30 edits per minute per user
  const userId = session.user.id ?? getClientIp(req);
  if (!rateLimit(`crossings:patch:${userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, riskLevel } = body;

    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string." }, { status: 400 });
      }
      sets.push(`name = $${idx++}`);
      values.push(name.trim());
    }

    if (description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(description ?? null);
    }

    if (riskLevel !== undefined) {
      const normalized = (riskLevel as string).toLowerCase();
      if (!VALID_RISK_LEVELS.has(normalized)) {
        return NextResponse.json(
          { error: `riskLevel must be one of: ${[...VALID_RISK_LEVELS].join(", ")}.` },
          { status: 400 }
        );
      }
      sets.push(`risk_level = $${idx++}`);
      values.push(normalized);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE crossing_zones SET ${sets.join(", ")}
       WHERE id = $${idx}
       RETURNING id, name, description, risk_level, created_at`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Zone not found." }, { status: 404 });
    }

    const row = rows[0];
    const zone: CrossingZone = {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      riskLevel: (row.risk_level as string).toUpperCase() as CrossingZone["riskLevel"],
      boundary: [],
      createdAt: row.created_at,
    };

    return NextResponse.json(zone);
  } catch {
    return NextResponse.json(
      { error: "Failed to update crossing zone." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only officers can delete crossing zones
  const session = await auth();
  if (!session?.user || session.user.role !== "officer") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Rate limit: 10 deletes per minute per user
  const userId = session.user.id ?? getClientIp(req);
  if (!rateLimit(`crossings:delete:${userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const { id } = await params;
    await pool.query(`DELETE FROM crossing_zones WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete crossing zone." },
      { status: 500 }
    );
  }
}
