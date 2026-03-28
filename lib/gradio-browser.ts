/**
 * Browser-side wrapper for calling the EleFind HF Spaces Gradio endpoint.
 *
 * Unlike lib/gradio-client.ts (which runs server-side only), this module is
 * imported by client components and sends the image directly from the browser
 * to HF Spaces — bypassing Vercel's 4.5 MB serverless function payload limit.
 *
 * The caller must obtain a spaceId first via GET /api/detect/authorize, which
 * validates the session and applies rate limiting before returning the space ID.
 */

import { Client } from "@gradio/client";
import type { DetectionParams, DetectionResult } from "@/types";

/** How long to wait after a cold-start failure before retrying (ms). */
const COLD_START_WAIT_MS = 8_000;

/**
 * Connect to the HF Spaces Gradio endpoint from the browser and run detection.
 * Automatically retries once after a short delay to handle cold-start wakeup
 * on the free tier (Spaces sleep after ~15 min of inactivity).
 *
 * @param spaceId  HF Space identifier, e.g. "iamhelitha/EleFind"
 * @param params   Detection parameters including the image File/Blob
 */
export async function runDetectionFromBrowser(
  spaceId: string,
  params: DetectionParams
): Promise<DetectionResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const client = await Client.connect(spaceId);

      const result = await client.predict("/detect", {
        image: params.image,
        conf_threshold: params.confThreshold ?? 0.30,
        slice_size: params.sliceSize ?? 1024,
        overlap_ratio: params.overlapRatio ?? 0.30,
        iou_threshold: params.iouThreshold ?? 0.40,
      });

      return parseResult(result.data as unknown[]);
    } catch (err) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, COLD_START_WAIT_MS));
        continue;
      }
      throw err;
    }
  }

  throw new Error("Detection failed after retry.");
}

function parseResult(data: unknown[]): DetectionResult {
  let annotatedImageUrl: string | null = null;
  if (data[0] && typeof data[0] === "object") {
    const img = data[0] as Record<string, unknown>;
    if (typeof img.url === "string") {
      annotatedImageUrl = img.url;
    }
  }

  const rawTable = data[7] as Record<string, unknown> | null;
  let detectionTable: Array<Record<string, unknown>> | null = null;
  let confidences: number[] = [];

  if (rawTable && typeof rawTable === "object") {
    const df = rawTable as { headers?: string[]; data?: unknown[][] };
    if (df.headers && df.data) {
      detectionTable = df.data.map((row) => {
        const obj: Record<string, unknown> = {};
        df.headers!.forEach((h, i) => { obj[h] = row[i]; });
        return obj;
      });
      const confIdx = df.headers.findIndex(
        (h) => h.toLowerCase().includes("confidence") || h.toLowerCase().includes("conf")
      );
      if (confIdx >= 0) {
        confidences = df.data
          .map((row) => Number(row[confIdx]))
          .filter((v) => !isNaN(v));
      }
    }
  }

  return {
    annotatedImageUrl,
    elephantCount: Number(data[1]) || 0,
    avgConfidence: Number(data[2]) || 0,
    maxConfidence: Number(data[3]) || 0,
    minConfidence: Number(data[4]) || 0,
    paramsText: String(data[5] ?? ""),
    confidences,
    detectionTable,
  };
}
