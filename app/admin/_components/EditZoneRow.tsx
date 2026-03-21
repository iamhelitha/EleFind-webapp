"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Zone {
  id: string;
  name: string;
  description: string | null;
  risk_level: string;
  confirmation_count: number;
  created_at: string;
}

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

const CREDIBILITY = (count: number) => {
  if (count === 0) return { label: "Unverified", cls: "text-gray-400" };
  if (count <= 2) return { label: "Low confidence", cls: "text-amber-500" };
  if (count <= 9) return { label: "Confirmed", cls: "text-green-600" };
  return { label: "High confidence", cls: "text-green-800 font-semibold" };
};

const RISK_BADGE: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function EditZoneRow({ zone }: { zone: Zone }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(zone.name);
  const [description, setDescription] = useState(zone.description ?? "");
  const [riskLevel, setRiskLevel] = useState(zone.risk_level);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cred = CREDIBILITY(zone.confirmation_count);

  async function handleSave() {
    setLoading(true);
    try {
      await fetch(`/api/crossings/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, riskLevel }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete zone "${zone.name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await fetch(`/api/crossings/${zone.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <tr className="bg-green-50">
        <td className="px-4 py-2" colSpan={5}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-muted mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-card-border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-muted mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border border-card-border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Risk</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="rounded border border-card-border px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded px-3 py-1 text-sm font-semibold bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
              >
                {loading ? "…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded px-3 py-1 text-sm border border-card-border text-muted hover:border-green-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100">
      <td className="px-4 py-3 text-sm font-medium text-green-900">{zone.name}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            RISK_BADGE[zone.risk_level] ?? ""
          }`}
        >
          {zone.risk_level}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted">{zone.confirmation_count}</td>
      <td className="px-4 py-3">
        <span className={`text-xs ${cred.cls}`}>{cred.label}</span>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        {new Date(zone.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 border border-green-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}
