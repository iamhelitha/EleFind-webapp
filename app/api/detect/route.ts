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
import { runDetection } from "@/lib/gradio-client";
import type { DetectionApiResponse } from "@/types";

/** Maximum image upload size: 50 MB. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/tiff",
]);

export async function POST(req: NextRequest): Promise<NextResponse<DetectionApiResponse>> {
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

    // Convert File → Blob for the Gradio client
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    const result = await runDetection({
      image: blob,
      confThreshold,
      sliceSize,
      overlapRatio,
      iouThreshold,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[/api/detect] Inference failed:", error);

    // Provide a user-friendly message when HF Spaces is down
    const message =
      error instanceof Error && error.message.includes("Could not")
        ? "Inference engine temporarily unavailable. The detection model runs on Hugging Face Spaces free tier — please try again in a moment."
        : "Detection failed. Please try again.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
