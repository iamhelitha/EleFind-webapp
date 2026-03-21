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
      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50 transition-colors"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
