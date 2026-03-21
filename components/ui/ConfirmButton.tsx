"use client";

import { useEffect, useState } from "react";

interface ConfirmButtonProps {
  id: string;
  type: "zone" | "detection";
  initialCount: number;
  size?: "sm" | "md";
}

export default function ConfirmButton({
  id,
  type,
  initialCount,
  size = "md",
}: ConfirmButtonProps) {
  const storageKey = `confirmed_${type}_${id}`;
  const apiPath =
    type === "zone"
      ? `/api/crossings/${id}/confirm`
      : `/api/detections/${id}/confirm`;

  const [count, setCount] = useState(initialCount);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setConfirmed(localStorage.getItem(storageKey) === "1");
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(apiPath, { method: "POST" });

      if (res.status === 409) {
        // Already confirmed server-side — sync local state silently
        setConfirmed(true);
        localStorage.setItem(storageKey, "1");
        return;
      }

      if (res.ok) {
        const data = (await res.json()) as { confirmationCount: number };
        setCount(data.confirmationCount);
        setConfirmed(true);
        localStorage.setItem(storageKey, "1");
      }
    } catch {
      // Network error — fail silently
    } finally {
      setLoading(false);
    }
  }

  const label =
    count > 0
      ? `✓ Still here (${count})`
      : "✓ Confirm sighting";

  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-xs"
      : "px-3 py-1 text-xs";

  const styleClass = confirmed
    ? "bg-green-700 text-white border-green-700"
    : "bg-transparent text-green-700 border-green-600 hover:bg-green-50";

  return (
    <button
      onClick={handleClick}
      disabled={loading || confirmed}
      title="Confirm you have seen elephants in this area"
      className={`
        inline-flex items-center rounded-full border font-medium
        transition-colors disabled:cursor-default
        ${sizeClass} ${styleClass}
      `}
    >
      {loading ? "…" : label}
    </button>
  );
}
