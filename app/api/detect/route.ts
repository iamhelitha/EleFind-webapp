/**
 * POST /api/detect
 *
 * Receives an uploaded image + SAHI parameters from the frontend,
 * forwards them to the Hugging Face Spaces Gradio endpoint via
 * @gradio/client, and returns the structured detection result.
 *
 * This API route runs server-side so the HF Space URL is never
 * exposed to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUserFromRequest } from "@/lib/server-auth";
import { runDetection } from "@/lib/gradio-client";
import { persistDetectionAsync } from "@/lib/persist-detection";
import { extractCoordsFromExif } from "@/lib/geo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { DetectionApiResponse } from "@/types";

/** Maximum image upload size: 50 MB. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/tiff",
]);

export async function POST(req: NextRequest): Promise<NextResponse<DetectionApiResponse>> {
  // Require authentication — detection triggers HF Space usage and DB writes
  const user = await getServerAuthUserFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Sign in to use detection." },
      { status: 401 }
    );
  }

  // Rate limit: 10 detections per minute per user
  const userId = user.id ?? getClientIp(req);
  if (!rateLimit(`detect:${userId}`, 10, 60_000)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a moment before detecting again." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image provided." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Accepted: JPG, PNG, TIFF.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 50 MB size limit." },
        { status: 400 }
      );
    }

    // Parse optional SAHI parameters from the form
    const confThreshold = parseFloat(formData.get("confThreshold") as string) || 0.30;
    const sliceSize = parseInt(formData.get("sliceSize") as string, 10) || 1024;
    const overlapRatio = parseFloat(formData.get("overlapRatio") as string) || 0.30;
    const iouThreshold = parseFloat(formData.get("iouThreshold") as string) || 0.40;

    // Extract EXIF coordinates from the image
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const coords = await extractCoordsFromExif(fileBuffer);

    // Re-create blob since we consumed the arrayBuffer
    const blob = new Blob([fileBuffer], { type: file.type });

    const result = await runDetection({
      image: blob,
      confThreshold,
      sliceSize,
      overlapRatio,
      iouThreshold,
    });

    // Attach location and timestamp to result
    const enrichedResult = {
      ...result,
      location: coords ?? undefined,
      detectedAt: new Date().toISOString(),
    };

    // Non-blocking — DB failure must never affect the detection response
    persistDetectionAsync(file, result, {
      confThreshold,
      sliceSize,
      overlapRatio,
      iouThreshold,
    }).catch(() => {
      // Persist failure is silent to the user; logged inside persistDetectionAsync
    });

    return NextResponse.json({ success: true, data: enrichedResult });
  } catch (error) {
    // Provide a user-friendly message without leaking internals
    const isUnavailable =
      error instanceof Error &&
      (error.message.includes("Could not") || error.message.includes("fetch"));

    const message = isUnavailable
      ? "Inference engine temporarily unavailable. The detection model runs on Hugging Face Spaces free tier — please wait ~30 seconds for it to wake up, then try again."
      : "Detection failed. Please try again.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
