"use client";

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, ImageIcon, X, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import type { DetectionStatus } from "@/types";

/**
 * Drag-and-drop image upload component with SAHI parameter sliders.
 *
 * Accepts JPG, PNG, and TIFF files up to 50 MB.
 * TIFF files cannot be previewed natively — a placeholder is shown instead.
 */

const ACCEPTED = ".jpg,.jpeg,.png,.tif,.tiff";
const MAX_SIZE = 50 * 1024 * 1024;

interface ImageUploaderProps {
  onDetect: (file: File, params: { confThreshold: number; sliceSize: number; overlapRatio: number; iouThreshold: number }) => void;
  status: DetectionStatus;
}

const STATUS_LABELS: Record<DetectionStatus, string> = {
  idle: "",
  uploading: "Uploading image…",
  connecting: "Connecting to inference engine…",
  detecting: "Running SAHI detection — this may take a minute…",
  processing: "Processing results…",
  done: "Detection complete",
  error: "Detection failed",
};

export default function ImageUploader({ onDetect, status }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SAHI parameters — defaults match app.py
  const [confThreshold, setConfThreshold] = useState(0.30);
  const [sliceSize, setSliceSize] = useState(1024);
  const [overlapRatio, setOverlapRatio] = useState(0.30);
  const [iouThreshold, setIouThreshold] = useState(0.40);

  const isProcessing = status !== "idle" && status !== "done" && status !== "error";

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (f.size > MAX_SIZE) {
      setError("File exceeds the 50 MB size limit.");
      return;
    }
    const isTiff = f.type === "image/tiff" || f.name.toLowerCase().endsWith(".tif") || f.name.toLowerCase().endsWith(".tiff");
    setFile(f);
    if (isTiff) {
      setPreview(null); // TIFF can't be previewed in <img>
    } else {
      setPreview(URL.createObjectURL(f));
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDetect = () => {
    if (!file) return;
    onDetect(file, { confThreshold, sliceSize, overlapRatio, iouThreshold });
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
          p-8 text-center transition-colors cursor-pointer
          ${dragOver ? "border-green-500 bg-green-100/40" : "border-card-border hover:border-green-300 hover:bg-green-100/20"}
          ${file ? "cursor-default" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={onChange}
          className="hidden"
        />

        {file ? (
          <div className="w-full">
            {/* Preview or placeholder */}
            {preview ? (
              <img
                src={preview}
                alt="Uploaded preview"
                className="mx-auto max-h-72 rounded-lg object-contain"
              />
            ) : (
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-green-100">
                <ImageIcon className="h-16 w-16 text-green-500" />
              </div>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">{file.name}</span>
              <span>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="ml-1 rounded-full p-1 hover:bg-red-100 text-muted hover:text-risk-high transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-green-500 mb-3" />
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop an aerial image here
            </p>
            <p className="mt-1 text-xs text-muted">
              or click to browse &middot; JPG, PNG, TIFF &middot; max 50 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-risk-high">{error}</p>
      )}

      {/* SAHI parameter controls */}
      {file && (
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
                min={0.05} max={0.95} step={0.05}
                onChange={setConfThreshold}
                format={(v) => v.toFixed(2)}
              />
              <SliderField
                label="Slice Size (px)"
                value={sliceSize}
                min={256} max={2048} step={128}
                onChange={setSliceSize}
                format={(v) => v.toString()}
              />
              <SliderField
                label="Overlap Ratio"
                value={overlapRatio}
                min={0.1} max={0.6} step={0.05}
                onChange={setOverlapRatio}
                format={(v) => v.toFixed(2)}
              />
              <SliderField
                label="IoU Threshold"
                value={iouThreshold}
                min={0.1} max={0.9} step={0.05}
                onChange={setIouThreshold}
                format={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 rounded-lg bg-green-100/50 px-4 py-3 text-sm text-green-900">
          <div className="h-2 w-2 animate-pulse-slow rounded-full bg-green-500" />
          {STATUS_LABELS[status]}
        </div>
      )}

      {/* Detect button */}
      <Button
        onClick={handleDetect}
        disabled={!file || isProcessing}
        loading={isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? STATUS_LABELS[status] : "Detect Elephants"}
      </Button>
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
          min={min} max={max} step={step}
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
