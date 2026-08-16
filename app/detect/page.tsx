"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import exifr from "exifr";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
} from "lucide-react";
import ImageUploader from "@/components/detection/ImageUploader";
import DetectionResults from "@/components/detection/DetectionResults";
import PipelineBand from "@/components/detection/PipelineBand";
import Card from "@/components/ui/Card";
import { runDetectionFromBrowser } from "@/lib/gradio-browser";
import type {
  BatchItem,
  SahiParams,
} from "@/types";

/**
 * Batch-capable detection page.
 *
 * Structure, following the redesign:
 *  1. Sand band stating the workflow, with the four pipeline step cards
 *     carrying real counts (see PipelineBand)
 *  2. Two columns on wide screens — upload queue on the left, review on
 *     the right; stacked on narrow screens
 *  3. Expandable per-image results in the review column
 */

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

  // Summary stats
  const doneItems = items.filter((i) => i.status === "done");
  const totalElephants = doneItems.reduce(
    (sum, i) => sum + (i.result?.elephantCount ?? 0),
    0
  );
  const meanConfidence =
    doneItems.length > 0
      ? doneItems.reduce((sum, i) => sum + (i.result?.avgConfidence ?? 0), 0) /
        doneItems.length
      : 0;


  return (
    <div className="animate-fade-in">
      {/* ─── Workflow band ──────────────────────────────────────── */}
      <section className="border-b border-divider bg-sand-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
            <h1 className="m-0 text-[clamp(22px,3vw,28px)]">
              Upload → Detect → Review → Map
            </h1>
            <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.5] text-[rgba(32,30,29,0.7)]">
              Upload one or more aerial images. EleFind identifies possible
              elephants, returns annotated results and confidence scores, and
              maps the sighting automatically when GPS metadata is available.
            </p>
          </div>

          <div className="mt-4">
            <PipelineBand
              items={items}
              isProcessing={isProcessing}
              currentIndex={currentIndex}
            />
          </div>
        </div>
      </section>

      {/* ─── Queue + review ─────────────────────────────────────── */}
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[400px_1fr] xl:items-start">
        {/* Left column — upload, queue, SAHI parameters */}
        <div className="flex flex-col gap-4">
          <Card className="p-4 sm:p-5">
            <ImageUploader
              items={items}
              setItems={setItems}
              onRunBatch={runBatch}
              isProcessing={isProcessing}
              currentIndex={currentIndex}
            />
          </Card>

          <div className="flex items-start gap-2.5 rounded-card bg-accent-100 px-4 py-3.5">
            <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-accent" />
            <p className="m-0 text-[12.5px] leading-[1.5] text-accent-900">
              <strong>Manual review recommended</strong> in dense canopy or heavy
              occlusion. Detections you reject never reach the map.
            </p>
          </div>
        </div>

        {/* Right column — review */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="m-0 text-[clamp(20px,2.5vw,28px)]">Review</h2>
            {doneItems.length > 0 ? (
              <span className="mono text-xs text-[rgba(32,30,29,0.55)]">
                {doneItems.length} frame{doneItems.length === 1 ? "" : "s"} ·{" "}
                {totalElephants} candidate{totalElephants === 1 ? "" : "s"} ·
                mean {meanConfidence.toFixed(2)}
              </span>
            ) : (
              <span className="mono text-xs text-[rgba(32,30,29,0.55)]">
                results appear here once a frame finishes
              </span>
            )}
          </div>

          {doneItems.length === 0 ? (
            <div className="rounded-panel border border-dashed border-neutral-400 bg-sand-surface px-6 py-14 text-center">
              <p className="m-0 text-sm text-[rgba(32,30,29,0.6)]">
                Nothing to review yet. Queue an aerial frame on the left and run
                detection.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {doneItems.map((item) => {
                const result = item.result;
                if (!result) return null;

                const isExpanded = expandedItem === item.id;
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedItem(isExpanded ? null : item.id)
                      }
                      aria-expanded={isExpanded}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(32,30,29,0.04)] sm:px-5"
                    >
                      {item.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.previewUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-300">
                          <Camera className="h-5 w-5 text-neutral-700" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="mono m-0 truncate text-[13px]">
                          {item.file.name}
                        </p>
                        <p className="mono m-0 mt-1 text-[10.5px] text-sage-700">
                          {result.elephantCount} candidate
                          {result.elephantCount === 1 ? "" : "s"}
                          {result.elephantCount > 0 &&
                            ` · mean ${result.avgConfidence.toFixed(2)}`}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {result.location && (
                            <span className="mono flex items-center gap-1 text-[10px] text-[rgba(32,30,29,0.5)]">
                              <MapPin className="h-3 w-3" />
                              {result.location.lat.toFixed(4)},{" "}
                              {result.location.lng.toFixed(4)}
                            </span>
                          )}
                          {result.detectedAt && (
                            <span className="mono flex items-center gap-1 text-[10px] text-[rgba(32,30,29,0.5)]">
                              <Clock className="h-3 w-3" />
                              {new Date(result.detectedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`mono shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          result.elephantCount > 0
                            ? "bg-sage-200 text-sage-800"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {result.elephantCount}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-[rgba(32,30,29,0.5)]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-[rgba(32,30,29,0.5)]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="animate-fade-in border-t border-divider px-4 py-4 sm:px-5 sm:py-5">
                        <DetectionResults result={result} />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
