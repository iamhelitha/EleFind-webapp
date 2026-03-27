import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);

  // Rate limit: 5 confirms per minute per IP
  if (!rateLimit(`confirm:detection:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const { id: detectionId } = await params;

    const ipHash = crypto
      .createHash("sha256")
      .update(ip + (process.env.AUTH_SECRET ?? ""))
      .digest("hex");

    const existing = await pool.query(
      `SELECT id FROM detection_confirmations WHERE detection_id = $1 AND ip_hash = $2`,
      [detectionId, ipHash]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Already confirmed", alreadyConfirmed: true },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO detection_confirmations (id, detection_id, ip_hash) VALUES ($1, $2, $3)`,
      [crypto.randomUUID(), detectionId, ipHash]
    );

    const { rows } = await pool.query(
      `UPDATE detections
       SET confirmation_count = confirmation_count + 1
       WHERE id = $1
       RETURNING confirmation_count`,
      [detectionId]
    );

    return NextResponse.json({ ok: true, confirmationCount: rows[0]?.confirmation_count ?? 1 });
  } catch {
    return NextResponse.json({ error: "Failed to confirm." }, { status: 500 });
  }
}
