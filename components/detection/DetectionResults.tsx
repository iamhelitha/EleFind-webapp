"use client";

import { useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Hash,
  ZoomIn,
  X,
  Maximize2,
  MapPin,
  Clock,
} from "lucide-react";
import Card from "@/components/ui/Card";
import ConfidenceChart from "./ConfidenceChart";
import DetectionTable from "./DetectionTable";
import type { DetectionResult } from "@/types";

/**
 * Detection results dashboard — displays a rich analysis view after
 * a successful elephant detection run.
 *
 * Layout:
 *  - Full-width annotated image with zoom/lightbox
 *  - 4 stat cards in a responsive row
 *  - Side-by-side: confidence chart + detection table
 *  - No-detection message if count is 0
 */

interface DetectionResultsProps {
  result: DetectionResult;
}

export default function DetectionResults({ result }: DetectionResultsProps) {
  const {
    annotatedImageUrl,
    elephantCount,
    avgConfidence,
    maxConfidence,
    minConfidence,
    confidences,
    detectionTable,
    location,
    detectedAt,
  } = result;

  const [lightbox, setLightbox] = useState(false);

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Annotated Image ─────────────────────────────────── */}
      {annotatedImageUrl && (
        <Card className="overflow-hidden group relative">
          <div className="relative">
            <img
              src={annotatedImageUrl}
              alt="Detection result with bounding boxes"
              className="w-full object-contain cursor-pointer"
              onClick={() => setLightbox(true)}
            />
            {/* Zoom hint overlay */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-green-900/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Expand
            </button>
          </div>
          <div className="border-t border-card-border bg-green-100/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-muted">
              Annotated result &middot; bounding boxes drawn by YOLOv11
            </span>
            <button
              onClick={() => setLightbox(true)}
              className="text-xs font-medium text-green-700 hover:text-green-900 transition-colors flex items-center gap-1"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Zoom
            </button>
          </div>
        </Card>
      )}

      {/* ─── Lightbox ────────────────────────────────────────── */}
      {lightbox && annotatedImageUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={annotatedImageUrl}
            alt="Detection result — full size"
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ─── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Hash className="h-5 w-5 text-green-700" />}
          label="Elephants Found"
          value={elephantCount.toString()}
          accent={elephantCount > 0 ? "bg-green-500/10" : "bg-amber-500/10"}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-amber-500" />}
          label="Avg Confidence"
          value={elephantCount > 0 ? pct(avgConfidence) : "—"}
          accent="bg-amber-500/10"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-risk-low" />}
          label="Max Confidence"
          value={elephantCount > 0 ? pct(maxConfidence) : "—"}
          accent="bg-risk-low/10"
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-risk-medium" />}
          label="Min Confidence"
          value={elephantCount > 0 ? pct(minConfidence) : "—"}
          accent="bg-risk-medium/10"
        />
      </div>

      {/* ─── Location & Date Info ─────────────────────────────── */}
      {(location || detectedAt) && (
        <div className="flex flex-wrap items-center gap-4 px-1">
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4 text-green-700" />
              <span>
                {location.lat.toFixed(5)}° {location.lat >= 0 ? "N" : "S"},{" "}
                {location.lng.toFixed(5)}° {location.lng >= 0 ? "E" : "W"}
              </span>
            </div>
          )}
          {!location && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>No GPS data in image EXIF</span>
            </div>
          )}
          {detectedAt && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-4 w-4 text-green-700" />
              <span>{new Date(detectedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Chart + Table side by side ──────────────────────── */}
      {elephantCount > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Confidence chart */}
          {confidences.length > 0 && (
            <Card className="p-5">
              <h3 className="font-heading text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-700" />
                Confidence Distribution
              </h3>
              <ConfidenceChart confidences={confidences} />
            </Card>
          )}

          {/* Detection table */}
          {detectionTable && detectionTable.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <Hash className="h-4 w-4 text-green-700" />
                <h3 className="font-heading text-sm font-bold text-green-900">
                  Detection Details
                </h3>
                <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {detectionTable.length} result{detectionTable.length > 1 ? "s" : ""}
                </span>
              </div>
              <DetectionTable rows={detectionTable} />
            </Card>
          )}
        </div>
      )}

      {/* ─── No detections message ───────────────────────────── */}
      {elephantCount === 0 && (
        <Card className="p-8 text-center border-dashed">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <ZoomIn className="h-6 w-6 text-amber-500" />
          </div>
          <p className="font-heading text-base font-bold text-amber-500">
            No elephants detected
          </p>
          <p className="mt-2 mx-auto max-w-md text-sm text-muted">
            The model did not find any elephants in this image at the current
            confidence threshold. Try lowering the confidence threshold or using
            a different image with clearer aerial coverage.
          </p>
        </Card>
      )}
    </div>
  );
}

/* ── Enhanced stat card ───────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  accent = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
        <div>
          <span className="font-heading text-xl font-bold text-green-900 block leading-tight">
            {value}
          </span>
          <span className="text-xs text-muted">{label}</span>
        </div>
      </div>
    </Card>
  );
}
