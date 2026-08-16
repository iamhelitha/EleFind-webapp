"use client";

import type { BatchItem } from "@/types";

/**
 * The Upload → Detect → Review → Map & alert band at the top of the
 * detect page.
 *
 * Each step shows a real figure rather than a decorative tick: how many
 * files are queued and how big they are, which frame is running, how many
 * results are back, and how many carry the GPS metadata needed to map them.
 */

const BYTES_PER_MB = 1024 * 1024;

type StepState = "idle" | "active" | "done";

interface Step {
  index: number;
  label: string;
  detail: string;
  /** 0–1 progress for the step's bar. */
  progress: number;
  state: StepState;
}

interface PipelineBandProps {
  items: readonly BatchItem[];
  isProcessing: boolean;
  /** Index of the item currently running, or -1 when idle. */
  currentIndex: number;
}

function buildSteps(
  items: readonly BatchItem[],
  isProcessing: boolean,
  currentIndex: number
): Step[] {
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const errored = items.filter((i) => i.status === "error").length;
  const settled = done + errored;

  const totalMb =
    items.reduce((sum, i) => sum + i.file.size, 0) / BYTES_PER_MB;
  const withGps = items.filter((i) => i.result?.location).length;
  const totalElephants = items.reduce(
    (sum, i) => sum + (i.result?.elephantCount ?? 0),
    0
  );

  const uploadState: StepState = total === 0 ? "idle" : "done";
  const detectState: StepState = isProcessing
    ? "active"
    : settled > 0 && settled === total
      ? "done"
      : "idle";
  const reviewState: StepState =
    done > 0 && !isProcessing ? "active" : done > 0 ? "idle" : "idle";
  const mapState: StepState = withGps > 0 ? "active" : "idle";

  return [
    {
      index: 1,
      label: "Upload",
      detail:
        total === 0
          ? "no files queued yet"
          : `${total} file${total === 1 ? "" : "s"} · ${totalMb.toFixed(1)} MB`,
      progress: total === 0 ? 0 : 1,
      state: uploadState,
    },
    {
      index: 2,
      label: "Detect",
      detail:
        total === 0
          ? "waiting for images"
          : isProcessing && currentIndex >= 0
            ? `frame ${currentIndex + 1} of ${total}`
            : `${settled} of ${total} processed`,
      progress: total === 0 ? 0 : settled / total,
      state: detectState,
    },
    {
      index: 3,
      label: "Review",
      detail:
        done === 0
          ? "no results yet"
          : `${totalElephants} candidate${totalElephants === 1 ? "" : "s"} across ${done} frame${done === 1 ? "" : "s"}`,
      progress: total === 0 ? 0 : done / total,
      state: reviewState,
    },
    {
      index: 4,
      label: "Map & alert",
      detail:
        done === 0
          ? "EXIF pin · officer verify · notify"
          : `${withGps} of ${done} frame${done === 1 ? "" : "s"} carry GPS`,
      progress: done === 0 ? 0 : withGps / done,
      state: mapState,
    },
  ];
}

const BADGE_STYLES: Record<StepState, string> = {
  idle: "border border-divider text-[rgba(32,30,29,0.55)]",
  active: "bg-accent text-sand",
  done: "bg-sage-600 text-white",
};

const BAR_STYLES: Record<StepState, string> = {
  idle: "bg-neutral-400",
  active: "bg-accent",
  done: "bg-sage-500",
};

export default function PipelineBand({
  items,
  isProcessing,
  currentIndex,
}: PipelineBandProps) {
  const steps = buildSteps(items, isProcessing, currentIndex);

  return (
    <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map(({ index, label, detail, progress, state }) => (
        <li
          key={label}
          className={`flex flex-col gap-2 rounded-card bg-sand p-4 ${
            state === "active" ? "border-[1.5px] border-accent" : ""
          } ${state === "idle" && index === 4 ? "opacity-60" : ""}`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`mono grid h-[22px] w-[22px] flex-none place-items-center rounded-full text-[10px] ${BADGE_STYLES[state]}`}
            >
              {state === "done" ? "✓" : index}
            </span>
            <span className="text-[14.5px] font-semibold">{label}</span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-neutral-300">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${BAR_STYLES[state]}`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          <span
            className={`mono text-[11px] ${
              state === "active"
                ? "text-accent-700"
                : "text-[rgba(32,30,29,0.55)]"
            }`}
          >
            {detail}
          </span>
        </li>
      ))}
    </ol>
  );
}
