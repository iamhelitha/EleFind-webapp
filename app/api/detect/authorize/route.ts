/**
 * GET /api/detect/authorize
 *
 * Validates the user's session and applies rate limiting before a detection
 * run. Returns the HF Space ID so the browser can connect to Gradio directly,
 * bypassing the serverless function payload limit for large images.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUserFromRequest } from "@/lib/server-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

const HF_SPACE = getRequiredEnv("HF_SPACE_NAME");

export async function GET(req: NextRequest) {
  const user = await getServerAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Sign in to use detection." },
      { status: 401 }
    );
  }

  const userId = user.id ?? getClientIp(req);
  if (!rateLimit(`detect:${userId}`, 10, 60_000)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a moment before detecting again." },
      { status: 429 }
    );
  }

  return NextResponse.json({ success: true, spaceId: HF_SPACE });
}
