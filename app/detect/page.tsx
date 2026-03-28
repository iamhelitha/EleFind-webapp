"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import exifr from "exifr";
import {
  Camera,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
} from "lucide-react";
import ImageUploader from "@/components/detection/ImageUploader";
import DetectionResults from "@/components/detection/DetectionResults";
import Card from "@/components/ui/Card";
import { runDetectionFromBrowser } from "@/lib/gradio-browser";
import type {
  BatchItem,
  SahiParams,
} from "@/types";

/**
 * Batch-capable detection page.
 *
 * Structure:
 *  1. Full-width header with pipeline visualisation (unchanged — user liked it)
 *  2. Unified detection panel: upload queue + results in one area
 *  3. Expandable per-image results below the queue
 */

/* ── Pipeline steps shown in the header ────────────────────────── */
const PIPELINE_STEPS = [
  { icon: Camera, label: "Upload", desc: "Aerial / drone image" },
  { icon: Layers, label: "SAHI Slicing", desc: "Tile-based inference" },
  { icon: Cpu, label: "YOLOv11", desc: "Object detection" },
  { icon: BarChart3, label: "Results", desc: "Annotated output" },
] as const;

export default function DetectPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  /**
   * Run detection on all pending items sequentially.
   *
   * Images are sent directly from the browser to HF Spaces via @gradio/client,
   * bypassing the Next.js API route and its 4.5 MB serverless payload limit.
   * Auth + rate limiting are checked via GET /api/detect/authorize (no image).
   * Results are persisted via POST /api/detect/persist (small JSON payload).
   */
  const runBatch = useCallback(
    async (pending: BatchItem[], params: SahiParams) => {
      setIsProcessing(true);

      for (let pi = 0; pi < pending.length; pi++) {
        const item = pending[pi];

        // Find the index of this item in the full queue for UI highlighting.
        let itemIndex = pi;
        setItems((prev) => {
          itemIndex = prev.findIndex((it) => it.id === item.id);
          return prev;
        });
        setCurrentIndex(itemIndex);

        // Update status → uploading (auth check phase)
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "uploading", errorMessage: undefined } : it
          )
        );

        try {
          // Step 1: Validate session + apply rate limit. Returns the HF Space ID.
          const authRes = await fetch("/api/detect/authorize");
          const authJson = await authRes.json();
          if (!authJson.success) {
            throw new Error(authJson.error ?? "Authorization failed");
          }
          const spaceId: string = authJson.spaceId;

          // Step 2: Extract GPS from EXIF in the browser (exifr works client-side).
          const gps = await exifr.gps(item.file).catch(() => null);
          const location = gps?.latitude != null && gps?.longitude != null
            ? { lat: gps.latitude, lng: gps.longitude }
            : null;

          // Update status → connecting
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "connecting" } : it
            )
          );

          // Step 3: Send image directly to HF Spaces from the browser.
          const result = await runDetectionFromBrowser(spaceId, {
            image: item.file,
            confThreshold: params.confThreshold,
            sliceSize: params.sliceSize,
            overlapRatio: params.overlapRatio,
            iouThreshold: params.iouThreshold,
          });

          // Update status → detecting → processing (brief visual feedback)
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "detecting" } : it
            )
          );
          await new Promise((r) => setTimeout(r, 300));

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "processing" } : it
            )
          );

          const enrichedResult = {
            ...result,
            location: location ?? undefined,
            detectedAt: new Date().toISOString(),
          };

          // Update status → done
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "done", result: enrichedResult }
                : it
            )
          );

          setExpandedItem((prev) => prev ?? item.id);

          if (result.elephantCount > 0) {
            toast.success(
              `${item.file.name}: ${result.elephantCount} elephant${result.elephantCount > 1 ? "s" : ""} detected`
            );
          }

          // Step 4: Persist to DB (fire-and-forget, small JSON payload).
          fetch("/api/detect/persist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              result,
              location,
              params,
              fileName: item.file.name,
              fileSize: item.file.size,
            }),
          }).catch(() => {
            // Persist failure is silent — never affects the detection result.
          });
        } catch (err) {
          const isUnavailable =
            err instanceof Error &&
            (err.message.includes("Could not") || err.message.includes("fetch"));

          const msg = isUnavailable
            ? "Inference engine temporarily unavailable. The detection model runs on Hugging Face Spaces free tier — please wait ~30 seconds for it to wake up, then try again."
            : err instanceof Error
              ? err.message
              : "Detection failed";

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "error", errorMessage: msg }
                : it
            )
          );
          toast.error(`${item.file.name}: ${msg}`);
        }
      }

      setIsProcessing(false);
      setCurrentIndex(-1);
    },
    []
  );

  // Calculate pipeline step based on current item's status
  const currentItem = currentIndex >= 0 ? items[currentIndex] : null;
  const currentStatus = currentItem?.status ?? "idle";
  const activeStep =
    currentStatus === "idle" || currentStatus === "done" || currentStatus === "error"
      ? -1
      : currentStatus === "uploading"
        ? 0
        : currentStatus === "connecting"
          ? 1
          : currentStatus === "detecting"
            ? 2
            : 3;

  // Summary stats
  const doneItems = items.filter((i) => i.status === "done");
  const totalElephants = doneItems.reduce(
    (sum, i) => sum + (i.result?.elephantCount ?? 0),
    0
  );

  return (
    <div className="animate-fade-in">
      {/* ─── Page Header with Pipeline ──────────────────────────── */}
      <div className="bg-green-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-green-700/60 px-3 py-1 text-xs font-semibold text-green-100">
                <Zap className="h-3.5 w-3.5" />
                YOLOv11 + SAHI Pipeline
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Elephant Detection
              </h1>
              <p className="mt-2 max-w-xl text-sm text-green-100/80">
                Upload aerial or drone images to detect elephants. Supports
                batch processing — queue multiple images and run them through
                the SAHI + YOLOv11 inference pipeline in sequence.
              </p>
            </div>

            {/* Pipeline visualisation — desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {PIPELINE_STEPS.map(({ icon: Icon, label, desc }, i) => {
                const isActive = i === activeStep;
                const isDone = activeStep > i || (doneItems.length > 0 && !isProcessing);
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`
                        flex flex-col items-center rounded-xl px-4 py-3 text-center transition-all duration-300
                        ${isActive ? "bg-amber-500/20 ring-1 ring-amber-500/50 scale-105" : ""}
                        ${isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-50"}
                      `}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          isDone && !isActive
                            ? "bg-green-500/20"
                            : isActive
                              ? "bg-amber-500/20"
                              : "bg-green-700/30"
                        }`}
                      >
                        {isDone && !isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-300" />
                        ) : (
                          <Icon
                            className={`h-5 w-5 ${isActive ? "text-amber-500 animate-pulse-slow" : "text-green-300"}`}
                          />
                        )}
                      </div>
                      <span className="mt-1.5 text-xs font-semibold">{label}</span>
                      <span className="text-[10px] text-green-300/70">{desc}</span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div
                        className={`h-px w-6 ${isDone && !isActive ? "bg-green-300" : "bg-green-700"} transition-colors`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline — mobile */}
          <div className="mt-6 flex lg:hidden gap-1">
            {PIPELINE_STEPS.map(({ label }, i) => {
              const isDone = activeStep > i || (doneItems.length > 0 && !isProcessing);
              const isActive = i === activeStep;
              return (
                <div key={label} className="flex-1">
                  <div
                    className={`
                      h-1.5 rounded-full transition-all duration-500
                      ${isDone ? "bg-green-300" : isActive ? "bg-amber-500 animate-pulse-slow" : "bg-green-700"}
                    `}
                  />
                  <span className="mt-1 block text-center text-[10px] text-green-300/60">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Content: Unified Detection Panel ─────────────── */}
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Unified card: queue + upload live here together */}
        <Card className="p-4 sm:p-5">
          <ImageUploader
            items={items}
            setItems={setItems}
            onRunBatch={runBatch}
            isProcessing={isProcessing}
            currentIndex={currentIndex}
          />
        </Card>

        {/* ─── Batch summary bar ────────────────────────────────── */}
        {doneItems.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-px flex-1 bg-card-border" />
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900 sm:px-4 sm:py-1.5 sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
              {doneItems.length} image{doneItems.length !== 1 ? "s" : ""}{" "}
              processed &middot; {totalElephants} elephant
              {totalElephants !== 1 ? "s" : ""} found
            </div>
            <div className="h-px flex-1 bg-card-border" />
          </div>
        )}

        {/* ─── Per-image results (expandable) ───────────────────── */}
        {doneItems.length > 0 && (
          <div className="space-y-2.5">
            {items
              .filter((i) => i.status === "done" && i.result)
              .map((item) => {
                const isExpanded = expandedItem === item.id;
                return (
                  <Card key={item.id} className="overflow-hidden">
                    {/* Accordion header */}
                    <button
                      onClick={() =>
                        setExpandedItem(isExpanded ? null : item.id)
                      }
                      className="w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-green-100/20 sm:px-5 sm:py-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                            <Camera className="h-5 w-5 text-green-500" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-green-900">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-muted">
                            {item.result!.elephantCount} elephant
                            {item.result!.elephantCount !== 1 ? "s" : ""} detected
                            {item.result!.elephantCount > 0 &&
                              ` · avg ${(item.result!.avgConfidence * 100).toFixed(1)}% confidence`}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            {item.result!.location && (
                              <span className="flex items-center gap-1 text-[10px] text-muted">
                                <MapPin className="h-3 w-3" />
                                {item.result!.location.lat.toFixed(5)}°,{" "}
                                {item.result!.location.lng.toFixed(5)}°
                              </span>
                            )}
                            {item.result!.detectedAt && (
                              <span className="flex items-center gap-1 text-[10px] text-muted">
                                <Clock className="h-3 w-3" />
                                {new Date(item.result!.detectedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Elephant count badge */}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
                          item.result!.elephantCount > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.result!.elephantCount}
                      </span>

                      {/* Expand arrow */}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted shrink-0" />
                      )}
                    </button>

                    {/* Expanded result */}
                    {isExpanded && (
                      <div className="animate-fade-in border-t border-card-border px-4 py-4 sm:px-5 sm:py-5">
                        <DetectionResults result={item.result!} />
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        )}

        {/* ─── Compact helper when queue is empty ─────────────────── */}
        {items.length === 0 && (
          <p className="px-1 text-center text-xs text-muted">
            Results will appear below after processing starts.
          </p>
        )}
      </div>
    </div>
  );
}
