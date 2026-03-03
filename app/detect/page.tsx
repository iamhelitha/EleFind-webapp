"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/detection/ImageUploader";
import DetectionResults from "@/components/detection/DetectionResults";
import type { DetectionResult, DetectionStatus, DetectionApiResponse } from "@/types";

/**
 * Main detection page.
 *
 * Layout:
 *  - Left panel: ImageUploader with parameter controls
 *  - Right panel: DetectionResults (annotated image, stats, chart, table)
 *  - On mobile: stacked vertically
 */

export default function DetectPage() {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleDetect = async (
    file: File,
    params: { confThreshold: number; sliceSize: number; overlapRatio: number; iouThreshold: number }
  ) => {
    setStatus("uploading");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("confThreshold", params.confThreshold.toString());
      formData.append("sliceSize", params.sliceSize.toString());
      formData.append("overlapRatio", params.overlapRatio.toString());
      formData.append("iouThreshold", params.iouThreshold.toString());

      setStatus("connecting");

      const res = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      setStatus("detecting");

      const json: DetectionApiResponse = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error ?? "Unknown error");
      }

      setStatus("processing");

      // Brief pause so the user sees the "processing" step
      await new Promise((r) => setTimeout(r, 400));

      setResult(json.data);
      setStatus("done");

      if (json.data.elephantCount > 0) {
        toast.success(`Detected ${json.data.elephantCount} elephant${json.data.elephantCount > 1 ? "s" : ""}!`);
      } else {
        toast("No elephants detected in this image.", { icon: "🔍" });
      }
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Detection failed";
      toast.error(msg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-green-900 sm:text-3xl">
          Elephant Detection
        </h1>
        <p className="mt-1 text-sm text-muted">
          Upload an aerial or drone image to detect elephants using YOLOv11 + SAHI inference.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Upload */}
        <div>
          <ImageUploader onDetect={handleDetect} status={status} />
        </div>

        {/* Right: Results */}
        <div>
          {result ? (
            <DetectionResults result={result} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-card-border p-12">
              <div className="text-center text-muted">
                <p className="text-sm font-medium">No detections yet</p>
                <p className="mt-1 text-xs">
                  Upload an image and click &ldquo;Detect Elephants&rdquo; to see results here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
