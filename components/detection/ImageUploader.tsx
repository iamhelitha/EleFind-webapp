"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Upload,
  ImageIcon,
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Play,
  FileImage,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import type { BatchItem, SahiParams } from "@/types";

/**
 * Batch-capable image upload + queue component.
 *
 * This is a unified panel: the queue IS the main interface, and the upload
 * button lives inside it. Supports multiple images in a batch queue.
 */

const ACCEPTED = ".jpg,.jpeg,.png,.tif,.tiff";
const MAX_SIZE = 50 * 1024 * 1024;

let batchIdCounter = 0;
function nextId() {
  return `batch-${++batchIdCounter}-${Date.now()}`;
}

interface ImageUploaderProps {
  items: BatchItem[];
  setItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  onRunBatch: (items: BatchItem[], params: SahiParams) => void;
  isProcessing: boolean;
  /** Index of the item currently being processed (-1 if none). */
  currentIndex: number;
}

function isTiff(f: File) {
  return (
    f.type === "image/tiff" ||
    f.name.toLowerCase().endsWith(".tif") ||
    f.name.toLowerCase().endsWith(".tiff")
  );
}

export default function ImageUploader({
  items,
  setItems,
  onRunBatch,
  isProcessing,
  currentIndex,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SAHI parameters
  const [confThreshold, setConfThreshold] = useState(0.30);
  const [sliceSize, setSliceSize] = useState(1024);
  const [overlapRatio, setOverlapRatio] = useState(0.30);
  const [iouThreshold, setIouThreshold] = useState(0.40);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const newItems: BatchItem[] = [];

      for (const f of Array.from(files)) {
        if (f.size > MAX_SIZE) {
          setError(`"${f.name}" exceeds the 50 MB limit and was skipped.`);
          continue;
        }
        const accepted = /\.(jpe?g|png|tiff?)$/i.test(f.name);
        if (!accepted) {
          setError(`"${f.name}" is not a supported format and was skipped.`);
          continue;
        }
        newItems.push({
          id: nextId(),
          file: f,
          previewUrl: isTiff(f) ? null : URL.createObjectURL(f),
          status: "idle",
          result: null,
        });
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
      }
    },
    [setItems]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so re-selecting same files works
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((i) => {
      if (i.previewUrl) URL.revokeObjectURL(i.previewUrl);
    });
    setItems([]);
  };

  const handleRun = () => {
    const pending = items.filter(
      (i) => i.status === "idle" || i.status === "error"
    );
    if (pending.length === 0) return;
    onRunBatch(pending, { confThreshold, sliceSize, overlapRatio, iouThreshold });
  };

  const pendingCount = items.filter(
    (i) => i.status === "idle" || i.status === "error"
  ).length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const totalElephants = items.reduce(
    (sum, i) => sum + (i.result?.elephantCount ?? 0),
    0
  );

  const statusIcon = (item: BatchItem, index: number) => {
    if (item.status === "done") {
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    }
    if (item.status === "error") {
      return <AlertCircle className="h-4 w-4 text-risk-high shrink-0" />;
    }
    if (
      isProcessing &&
      index === currentIndex &&
      item.status !== "idle" &&
      item.status !== "done"
    ) {
      return <Loader2 className="h-4 w-4 text-amber-500 animate-spin shrink-0" />;
    }
    return <FileImage className="h-4 w-4 text-muted/50 shrink-0" />;
  };

  const statusLabel = (item: BatchItem): string => {
    switch (item.status) {
      case "idle":
        return "Queued";
      case "uploading":
        return "Uploading…";
      case "connecting":
        return "Connecting…";
      case "detecting":
        return "Detecting…";
      case "processing":
        return "Processing…";
      case "done":
        return item.result
          ? `${item.result.elephantCount} elephant${item.result.elephantCount !== 1 ? "s" : ""}`
          : "Done";
      case "error":
        return item.errorMessage ?? "Failed";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Drop zone / Add images area ──────────────────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
          transition-colors
          ${items.length === 0 ? "p-10" : "p-5"}
          ${dragOver ? "border-green-500 bg-green-100/40" : "border-card-border hover:border-green-300 hover:bg-green-100/10"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          onChange={onChange}
          className="hidden"
        />

        {items.length === 0 ? (
          /* Empty state — large upload prompt */
          <button
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center cursor-pointer"
            disabled={isProcessing}
          >
            <div className="rounded-2xl bg-green-100 p-4 mb-3">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-900">
              Upload aerial images
            </p>
            <p className="mt-1 text-xs text-muted">
              Drag &amp; drop or click to browse &middot; JPG, PNG, TIFF
              &middot; max 50 MB each
            </p>
            <p className="mt-2 text-xs text-green-700 font-medium">
              Supports batch processing — select multiple images
            </p>
          </button>
        ) : (
          /* Queue has items — compact add-more prompt */
          <div className="w-full">
            {/* Queue header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-900">
                  {items.length} image{items.length !== 1 ? "s" : ""} in queue
                </span>
                {doneCount > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {doneCount} done &middot; {totalElephants} elephant
                    {totalElephants !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add More
                </button>
                {!isProcessing && items.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:text-risk-high hover:bg-risk-high/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Queue list */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
                    ${i === currentIndex && isProcessing ? "bg-amber-500/10 ring-1 ring-amber-500/30" : "bg-green-100/20 hover:bg-green-100/40"}
                    ${item.status === "done" ? "opacity-70" : ""}
                  `}
                >
                  {/* Thumbnail */}
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-9 w-9 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-md bg-green-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-4 w-4 text-green-500" />
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-900 truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-muted">
                      {(item.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {statusIcon(item, i)}
                    <span
                      className={`text-xs ${
                        item.status === "done"
                          ? "text-green-700 font-medium"
                          : item.status === "error"
                            ? "text-risk-high"
                            : "text-muted"
                      }`}
                    >
                      {statusLabel(item)}
                    </span>
                  </div>

                  {/* Remove button */}
                  {!isProcessing && item.status !== "done" && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-1 hover:bg-red-100 text-muted hover:text-risk-high transition-colors shrink-0"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-risk-high">{error}</p>}

      {/* ─── SAHI parameter controls ──────────────────────────────── */}
      {items.length > 0 && (
        <div>
          <button
            onClick={() => setShowParams(!showParams)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showParams ? "Hide" : "Show"} Detection Parameters
          </button>

          {showParams && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 rounded-xl border border-card-border bg-green-100/20 p-4 animate-fade-in">
              <SliderField
                label="Confidence Threshold"
                value={confThreshold}
                min={0.05}
                max={0.95}
                step={0.05}
                onChange={setConfThreshold}
                format={(v) => v.toFixed(2)}
              />
              <SliderField
                label="Slice Size (px)"
                value={sliceSize}
                min={256}
                max={2048}
                step={128}
                onChange={setSliceSize}
                format={(v) => v.toString()}
              />
              <SliderField
                label="Overlap Ratio"
                value={overlapRatio}
                min={0.1}
                max={0.6}
                step={0.05}
                onChange={setOverlapRatio}
                format={(v) => v.toFixed(2)}
              />
              <SliderField
                label="IoU Threshold"
                value={iouThreshold}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={setIouThreshold}
                format={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── Run batch button ─────────────────────────────────────── */}
      {items.length > 0 && (
        <Button
          onClick={handleRun}
          disabled={pendingCount === 0 || isProcessing}
          loading={isProcessing}
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              Processing {currentIndex + 1} of {items.length}…
            </>
          ) : pendingCount > 0 ? (
            <>
              <Play className="h-4 w-4" />
              Detect Elephants
              {pendingCount > 1 && ` (${pendingCount} images)`}
            </>
          ) : (
            <>All images processed</>
          )}
        </Button>
      )}
    </div>
  );
}

/* ── Slider sub-component ─────────────────────────────────────────── */

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-3 mt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 accent-green-700"
        />
        <span className="w-12 text-right text-sm font-mono text-foreground">
          {format(value)}
        </span>
      </div>
    </label>
  );
}
