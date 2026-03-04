"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Camera,
  Cpu,
  Layers,
  BarChart3,
  CheckCircle2,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ImageUploader from "@/components/detection/ImageUploader";
import DetectionResults from "@/components/detection/DetectionResults";
import Card from "@/components/ui/Card";
import type {
  BatchItem,
  SahiParams,
  DetectionApiResponse,
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
   * Each image is sent to /api/detect one at a time and its status is
   * updated in the queue in real-time.
   */
  const runBatch = useCallback(
    async (pending: BatchItem[], params: SahiParams) => {
      setIsProcessing(true);

      for (let pi = 0; pi < pending.length; pi++) {
        const item = pending[pi];

        // Find the index of this item in the full queue for UI highlighting.
        // We use a functional read of the latest state to avoid stale closure.
        let itemIndex = pi;
        setItems((prev) => {
          itemIndex = prev.findIndex((it) => it.id === item.id);
          return prev; // no mutation, just reading
        });
        setCurrentIndex(itemIndex);

        // Update status → uploading
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "uploading", errorMessage: undefined } : it
          )
        );

        try {
          const formData = new FormData();
          formData.append("image", item.file);
          formData.append("confThreshold", params.confThreshold.toString());
          formData.append("sliceSize", params.sliceSize.toString());
          formData.append("overlapRatio", params.overlapRatio.toString());
          formData.append("iouThreshold", params.iouThreshold.toString());

          // Update status → connecting
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "connecting" } : it
            )
          );

          const res = await fetch("/api/detect", {
            method: "POST",
            body: formData,
          });

          // Update status → detecting
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "detecting" } : it
            )
          );

          const json: DetectionApiResponse = await res.json();

          if (!json.success || !json.data) {
            throw new Error(json.error ?? "Unknown error");
          }

          // Update status → processing (brief)
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: "processing" } : it
            )
          );
          await new Promise((r) => setTimeout(r, 300));

          // Update status → done with result
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "done", result: json.data! }
                : it
            )
          );

          // Auto-expand the first completed item
          setExpandedItem((prev) => prev ?? item.id);

          if (json.data.elephantCount > 0) {
            toast.success(
              `${item.file.name}: ${json.data.elephantCount} elephant${json.data.elephantCount > 1 ? "s" : ""} detected`
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Detection failed";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Unified card: queue + upload live here together */}
        <Card className="p-6 sm:p-8">
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
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-card-border" />
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-900">
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
          <div className="space-y-3">
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
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-green-100/20 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail */}
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          <Camera className="h-5 w-5 text-green-500" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-900 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-muted">
                          {item.result!.elephantCount} elephant
                          {item.result!.elephantCount !== 1 ? "s" : ""} detected
                          {item.result!.elephantCount > 0 &&
                            ` · avg ${(item.result!.avgConfidence * 100).toFixed(1)}% confidence`}
                        </p>
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
                      <div className="border-t border-card-border px-5 py-5 animate-fade-in">
                        <DetectionResults result={item.result!} />
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        )}

        {/* ─── Empty state — no items yet ────────────────────────── */}
        {items.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <Camera className="h-8 w-8 text-green-500" />
            </div>
            <p className="font-heading text-lg font-bold text-green-900">
              No detections yet
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Upload aerial images above to run them through the YOLOv11 + SAHI
              elephant detection pipeline. You can queue multiple images for
              batch processing.
            </p>

            {/* Tech stack badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["YOLOv11", "SAHI", "Hugging Face", "Batch Processing"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
