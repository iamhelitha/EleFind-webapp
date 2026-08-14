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
  if (count <= 2) return { label: "Low confidence", cls: "text-accent-500" };
  if (count <= 9) return { label: "Confirmed", cls: "text-sage-700" };
  return { label: "High confidence", cls: "text-ink font-semibold" };
};

const RISK_BADGE: Record<string, string> = {
  low: "bg-sand-surface text-ink",
  medium: "bg-accent-100 text-accent-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-clay-surface text-clay-deep",
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
      <tr className="bg-sand/60">
        <td className="px-3 py-2.5" colSpan={5}>
          <div className="flex flex-wrap gap-2.5 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-divider px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-divider px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">Risk</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="rounded-lg border border-divider px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-accent focus:outline-none bg-sand"
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
                className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-accent text-white hover:bg-accent-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg px-3 py-1.5 text-xs border border-divider text-muted hover:border-sage-300 transition-colors"
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
    <tr className="hover:bg-neutral-100 transition-colors">
      <td className="px-3 py-2.5 font-medium text-ink">{zone.name}</td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            RISK_BADGE[zone.risk_level] ?? "bg-neutral-200 text-neutral-700"
          }`}
        >
          {zone.risk_level}
        </span>
      </td>
      <td className="px-3 py-2.5 text-muted text-center">{zone.confirmation_count}</td>
      <td className="px-3 py-2.5">
        <span className={`text-[11px] ${cred.cls}`}>{cred.label}</span>
      </td>
      <td className="px-3 py-2.5 text-muted whitespace-nowrap">
        {new Date(zone.created_at).toLocaleDateString()}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex gap-1.5">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-accent-700 hover:bg-sand border border-green-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-clay-text hover:bg-clay-surface border border-clay-border disabled:opacity-50 transition-colors"
          >
            {loading ? "…" : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}
