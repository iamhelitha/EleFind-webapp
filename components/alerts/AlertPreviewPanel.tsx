"use client";

import { useState } from "react";

/**
 * Step 3 of the alerts page — what an alert actually looks like when it
 * arrives, in-app and as the SMS fallback, plus the member's history.
 *
 * The two response buttons are the community reporting path: "I'm safe"
 * acknowledges, "I see them too" corroborates the sighting. Both record
 * locally for now — wire them to the confirmations API when it exists.
 */

type Response = "safe" | "confirmed" | null;

interface HistoryEntry {
  summary: string;
  status: string;
  statusClass: string;
}

const HISTORY: readonly HistoryEntry[] = [
  {
    summary: "19 Jul · 4 elephants · 3.1 km",
    status: "confirmed",
    statusClass: "text-sage-700",
  },
  {
    summary: "11 Jul · zone → CRITICAL",
    status: "read",
    statusClass: "text-accent-700",
  },
  {
    summary: "02 Jul · 2 elephants · 8.4 km",
    status: "expired",
    statusClass: "text-[rgba(32,30,29,0.5)]",
  },
];

export default function AlertPreviewPanel() {
  const [response, setResponse] = useState<Response>(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h6 className="eyebrow m-0 mb-2 text-accent">Step 3 · What arrives</h6>
        <h2 className="m-0 text-[29px] leading-[1.08]">The alert itself</h2>
      </div>

      <div className="flex flex-col gap-3 rounded-[34px] bg-night-panel p-4">
        <span className="mono px-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[rgba(240,233,217,0.5)]">
          In-app · 18:26
        </span>

        {/* ── The critical alert ─────────────────────────────────── */}
        <article className="overflow-hidden rounded-card bg-[rgba(140,47,34,0.92)] text-[#ffe8e2]">
          <div className="relative h-28 bg-[#1b2016]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(240,233,217,.06) 0 1px, transparent 1px 16%), repeating-linear-gradient(0deg, rgba(240,233,217,.06) 0 1px, transparent 1px 25%)",
              }}
            />
            <div className="absolute left-[32%] top-[56%] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-sage-600 bg-sand" />
            <div className="absolute left-[62%] top-[34%] h-4 w-4 rounded-full bg-accent-400 shadow-[0_0_0_8px_rgba(246,160,107,0.22)]" />
            <span className="mono absolute bottom-2 right-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
              3.1 km north-east
            </span>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ffb4a2]" />
              <span className="mono text-[10.5px] uppercase tracking-[0.08em]">
                Verified sighting near you
              </span>
            </div>

            <h3 className="m-0 mt-2 font-heading text-[22px] text-white">
              4 elephants, 3 km away
            </h3>
            <p className="m-0 mt-1.5 text-[12.5px] leading-[1.55]">
              Seen at 18:24 between Hingurakgoda and the Minneriya road. Avoid
              that road tonight; keep livestock in and do not approach to look.
            </p>

            <div className="mt-3.5 flex gap-2">
              <button
                onClick={() => setResponse("safe")}
                aria-pressed={response === "safe"}
                className={`mono flex-1 cursor-pointer rounded-full px-4 py-2 text-[11.5px] font-semibold transition-colors ${
                  response === "safe"
                    ? "bg-[#ffe8e2] text-clay-deep"
                    : "bg-white text-clay-text hover:bg-[#ffe8e2]"
                }`}
              >
                {response === "safe" ? "✓ Marked safe" : "I'm safe"}
              </button>
              <button
                onClick={() => setResponse("confirmed")}
                aria-pressed={response === "confirmed"}
                className={`mono cursor-pointer rounded-full border px-4 py-2 text-[11.5px] font-semibold transition-colors ${
                  response === "confirmed"
                    ? "border-white bg-white/20 text-white"
                    : "border-white/45 text-white hover:bg-white/10"
                }`}
              >
                {response === "confirmed" ? "✓ Reported" : "I see them too"}
              </button>
            </div>

            {response === "confirmed" && (
              <p className="mono m-0 mt-2.5 text-[10.5px] text-[#ffe8e2]/80">
                Your corroboration is queued for the officer reviewing this
                sighting.
              </p>
            )}
          </div>
        </article>

        {/* ── SMS fallback ───────────────────────────────────────── */}
        <div className="rounded-[22px] bg-[rgba(240,233,217,0.07)] p-3.5 text-night-text">
          <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-[rgba(240,233,217,0.5)]">
            SMS fallback
          </span>
          <p className="mono m-0 mt-2 text-xs leading-[1.6]">
            EleFind: 4 elephants seen ~3 km NE of Hingurakgoda at 18:24. Avoid
            Minneriya road tonight. Do not approach. Reply STOP to unsubscribe.
          </p>
        </div>

        {/* ── All clear ──────────────────────────────────────────── */}
        <div className="rounded-[22px] bg-[rgba(174,191,146,0.14)] p-3.5 text-[#e6ecd8]">
          <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-sage-300">
            All clear · 22:40
          </span>
          <p className="m-0 mt-1.5 text-[12.5px] leading-[1.55]">
            No sightings in your area for 4 hours. The herd moved north into the
            park.
          </p>
        </div>
      </div>

      {/* ── History ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 rounded-[30px] bg-sand-surface p-5">
        <h6 className="eyebrow m-0 text-[rgba(32,30,29,0.55)]">
          Your alert history
        </h6>
        <ul className="mono m-0 flex list-none flex-col gap-1.5 p-0 text-[11.5px] text-[rgba(32,30,29,0.75)]">
          {HISTORY.map(({ summary, status, statusClass }) => (
            <li key={summary} className="flex justify-between gap-3">
              <span>{summary}</span>
              <span className={statusClass}>{status}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 border-t border-divider pt-2.5 text-[11.5px] leading-[1.5] text-[rgba(32,30,29,0.6)]">
          Alerts are a research decision-support service, not an emergency line.
          In danger, contact the DWC hotline 1919.
        </p>
      </div>
    </div>
  );
}
