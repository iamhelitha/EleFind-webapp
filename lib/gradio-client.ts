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

const HF_SPACE = process.env.HF_SPACE_NAME ?? "iamhelitha/EleFind";

/**
 * Connect to the HF Spaces Gradio endpoint and run elephant detection.
 *
 * @throws Will throw if the Space is sleeping or unreachable.
 */
export async function runDetection(params: DetectionParams): Promise<DetectionResult> {
  const client = await Client.connect(HF_SPACE);

  const result = await client.predict("/detect", {
    image: params.image,
    conf_threshold: params.confThreshold ?? 0.30,
    slice_size: params.sliceSize ?? 1024,
    overlap_ratio: params.overlapRatio ?? 0.30,
    iou_threshold: params.iouThreshold ?? 0.40,
  });

  // The Gradio client returns `result.data` as an ordered array
  // matching the tuple order defined in app.py's `process_image`.
  const data = result.data as unknown[];

  // data[0] can be a file descriptor object { url, ... } or a Blob
  let annotatedImageUrl: string | null = null;
  if (data[0] && typeof data[0] === "object") {
    const img = data[0] as Record<string, unknown>;
    if (typeof img.url === "string") {
      annotatedImageUrl = img.url;
    } else if (img instanceof Blob) {
      // Shouldn't normally happen in server context, but handle gracefully
      annotatedImageUrl = null;
    }
  }

  // data[6] (chart) and data[7] (table) can be DataFrame objects
  // or null if no elephants were detected.
  const rawTable = data[7] as Record<string, unknown> | null;
  let detectionTable: Array<Record<string, unknown>> | null = null;
  let confidences: number[] = [];

  if (rawTable && typeof rawTable === "object") {
    // Gradio DataFrames come as { headers: string[], data: unknown[][] }
    const df = rawTable as { headers?: string[]; data?: unknown[][] };
    if (df.headers && df.data) {
      detectionTable = df.data.map((row) => {
        const obj: Record<string, unknown> = {};
        df.headers!.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
      // Extract confidence values from the table
      const confIdx = df.headers.findIndex(
        (h) => h.toLowerCase().includes("confidence") || h.toLowerCase().includes("conf")
      );
      if (confIdx >= 0) {
        confidences = df.data.map((row) => Number(row[confIdx])).filter((v) => !isNaN(v));
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
