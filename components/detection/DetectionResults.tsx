"use client";

import { Activity, TrendingUp, TrendingDown, Hash } from "lucide-react";
import Card from "@/components/ui/Card";
import ConfidenceChart from "./ConfidenceChart";
import DetectionTable from "./DetectionTable";
import type { DetectionResult } from "@/types";

/**
 * Displays the results of an elephant detection run:
 *  - Annotated image with bounding boxes
 *  - Summary stats (count, avg/max/min confidence)
 *  - Confidence bar chart
 *  - Raw detection table
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
  } = result;

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Annotated image */}
      {annotatedImageUrl && (
        <div className="overflow-hidden rounded-xl border border-card-border">
          <img
            src={annotatedImageUrl}
            alt="Detection result with bounding boxes"
            className="w-full object-contain"
          />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Hash className="h-5 w-5 text-green-700" />}
          label="Elephants"
          value={elephantCount.toString()}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-amber-500" />}
          label="Avg Confidence"
          value={elephantCount > 0 ? pct(avgConfidence) : "—"}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-risk-low" />}
          label="Max Confidence"
          value={elephantCount > 0 ? pct(maxConfidence) : "—"}
        />
        <StatCard
          icon={<TrendingDown className="h-5 w-5 text-risk-medium" />}
          label="Min Confidence"
          value={elephantCount > 0 ? pct(minConfidence) : "—"}
        />
      </div>

      {/* Confidence chart */}
      {confidences.length > 0 && (
        <Card className="p-4">
          <h3 className="font-heading text-sm font-bold text-green-900 mb-3">
            Detection Confidence Distribution
          </h3>
          <ConfidenceChart confidences={confidences} />
        </Card>
      )}

      {/* Detection table */}
      {detectionTable && detectionTable.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-heading text-sm font-bold text-green-900">
              Detection Details
            </h3>
          </div>
          <DetectionTable rows={detectionTable} />
        </Card>
      )}

      {/* No detections message */}
      {elephantCount === 0 && (
        <div className="rounded-xl border border-card-border bg-amber-500/5 p-6 text-center">
          <p className="text-sm font-medium text-amber-500">
            No elephants detected in this image.
          </p>
          <p className="mt-1 text-xs text-muted">
            Try adjusting the confidence threshold or using a different image.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Stat card sub-component ──────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex flex-col items-center p-3 text-center">
      {icon}
      <span className="mt-1 font-heading text-xl font-bold text-green-900">
        {value}
      </span>
      <span className="text-xs text-muted">{label}</span>
    </Card>
  );
}
