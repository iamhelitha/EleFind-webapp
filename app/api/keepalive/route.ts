import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

function isAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  // Temporary backward compatibility header for non-Bearer cron senders.
  const legacyHeaderToken = request.headers.get("x-cron-secret") ?? "";

  return bearerToken === configuredSecret || legacyHeaderToken === configuredSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query("SELECT NOW() AS now, 1 AS alive");
    const row = result.rows[0] as { now: string; alive: number };

    return NextResponse.json(
      {
        ok: true,
        db: "up",
        timestamp: row.now,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
      },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    await pool.query("SELECT 1");
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
