/**
 * POST /api/detect/persist
 *
 * Persists a detection result that was produced by a direct browser-to-HF
 * Space call. Accepts a small JSON payload (no image bytes), so it stays well
 * within Vercel's serverless function size limits.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUserFromRequest } from "@/lib/server-auth";
import { persistDetectionFromData } from "@/lib/persist-detection";
import type { DetectionResult, SahiParams } from "@/types";

interface PersistBody {
  result: DetectionResult;
  location: { lat: number; lng: number } | null;
  params: SahiParams;
  fileName: string;
  fileSize: number;
}

export async function POST(req: NextRequest) {
  const user = await getServerAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: PersistBody = await req.json();
    await persistDetectionFromData(body);
    return NextResponse.json({ success: true });
  } catch {
    // Persist failure is non-critical; swallow silently (same behaviour as the
    // fire-and-forget path in the original /api/detect route).
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
