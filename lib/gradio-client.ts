/**
 * Wrapper around @gradio/client for calling the EleFind HF Spaces endpoint.
 *
 * The Gradio `app.py` exposes a `/detect` endpoint that accepts an image
 * and SAHI parameters, runs YOLOv11 + SAHI inference, and returns an
 * 8-element tuple:
 *
 *   [0] annotated image   (file URL or blob)
 *   [1] elephant count     (number)
 *   [2] avg confidence     (float)
 *   [3] max confidence     (float)
 *   [4] min confidence     (float)
 *   [5] params markdown    (string)
 *   [6] confidence chart   (DataFrame or null)
 *   [7] detection table    (DataFrame or null)
 *
 * This file runs SERVER-SIDE ONLY (called from API routes).
 * Never import this in client components — the HF Space name is kept in
 * env vars and must not leak to the browser bundle.
 */

import { Client } from "@gradio/client";
import type { DetectionParams, DetectionResult } from "@/types";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

const HF_SPACE = getRequiredEnv("HF_SPACE_NAME");

/** How long to wait after a cold-start failure before retrying (ms). */
const COLD_START_WAIT_MS = 8_000;

/**
 * Connect to the HF Spaces Gradio endpoint and run elephant detection.
 * Automatically retries once after a short delay to handle cold-start
 * wakeup on the free tier (Spaces sleep after ~15 min of inactivity).
 *
 * @throws Will throw if the Space is unreachable after retry.
 */
export async function runDetection(params: DetectionParams): Promise<DetectionResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const client = await Client.connect(HF_SPACE);

      const result = await client.predict("/detect", {
        image: params.image,
        conf_threshold: params.confThreshold ?? 0.30,
        slice_size: params.sliceSize ?? 1024,
        overlap_ratio: params.overlapRatio ?? 0.30,
        iou_threshold: params.iouThreshold ?? 0.40,
      });

      return parseResult(result.data as unknown[]);
    } catch (err) {
      // On the first attempt, wait for the Space to wake up then retry
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, COLD_START_WAIT_MS));
        continue;
      }
      throw err;
    }
  }

  // TypeScript requires an explicit throw here even though the loop always
  // either returns or rethrows
  throw new Error("Detection failed after retry.");
}

function parseResult(data: unknown[]): DetectionResult {
  // data[0] can be a file descriptor object { url, ... } or a Blob
  let annotatedImageUrl: string | null = null;
  if (data[0] && typeof data[0] === "object") {
    const img = data[0] as Record<string, unknown>;
    if (typeof img.url === "string") {
      annotatedImageUrl = img.url;
    }
  }

  // data[6] (chart) and data[7] (table) can be DataFrame objects or null
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
