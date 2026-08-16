"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDetectionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this detection? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/detections/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded px-2 py-1 text-xs font-medium text-clay-text hover:bg-clay-surface border border-clay-border disabled:opacity-50 transition-colors"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
