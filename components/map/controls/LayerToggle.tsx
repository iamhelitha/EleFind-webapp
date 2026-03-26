"use client";

import { Eye, EyeOff } from "lucide-react";

/**
 * Individual layer on/off toggle switch.
 */

interface LayerToggleProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  color?: string;
  count?: number;
}

export default function LayerToggle({
  label,
  enabled,
  onToggle,
  color = "#2d6a4f",
  count,
}: LayerToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-green-50 transition-colors"
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded"
        style={{ color }}
      >
        {enabled ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4 opacity-40" />
        )}
      </span>
      <span className={`flex-1 text-sm ${enabled ? "text-green-900" : "text-muted"}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted tabular-nums">{count}</span>
      )}
    </button>
  );
}
