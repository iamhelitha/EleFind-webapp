import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { CrossingZone } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, riskLevel } = body;

    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (name !== undefined) {
      sets.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(description);
    }
    if (riskLevel !== undefined) {
      sets.push(`risk_level = $${idx++}`);
      values.push((riskLevel as string).toLowerCase());
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
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
  } catch (error) {
    console.error("[crossings PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update crossing zone." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await pool.query(`DELETE FROM crossing_zones WHERE id = $1`, [id]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[crossings DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete crossing zone." },
      { status: 500 }
    );
  }
}
