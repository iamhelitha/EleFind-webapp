import React from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import SriLankaGlyph from "@/components/brand/SriLankaGlyph";
import pool from "@/lib/db";

/**
 * Landing page for EleFind.
 *
 * Sections, following the redesign:
 *  1. Hero on the ink ground — research framing, not vanity counters
 *  2. The problem — human-elephant conflict in Sri Lanka
 *  3. Why EleFind — four capability cards
 *  4. Research evidence — the preliminary end-to-end validation
 *  5. Explainability — detection beside Grad-CAM
 *  6. Community alerts band
 *  7. Honest limits — best results / manual review / scope
 */

/* ── Static research figures ──────────────────────────────────────────
   These are fixed validation results, not live counts. They are quoted
   with their qualifiers so the page never reads as a field-accuracy
   claim. Do not wire these to the database. */
const HERO_FIGURES = [
  {
    value: "84.3%",
    caption: "mAP@0.5 on a 197-image validation set",
    qualifier: "Research validation",
    size: "text-[34px]",
  },
  {
    value: "25 / 26",
    caption: "elephants matched in a preliminary real-world check",
    qualifier: "Preliminary",
    size: "text-[34px]",
  },
  {
    value: "Image → Detection\n→ Map → Alert",
    caption: "one integrated workflow",
    qualifier: "≈3.2 s GPU · 14.4 s CPU",
    size: "text-[20px] leading-[1.25]",
  },
] as const;

const CAPABILITIES = [
  { n: "01", tone: "accent", text: "Browser-based — nothing to install locally" },
  { n: "02", tone: "accent", text: "Built specifically for aerial and drone imagery" },
  { n: "03", tone: "sage", text: "Converts geotagged detections into map locations" },
  { n: "04", tone: "sage", text: "Warns nearby households when a sighting is verified" },
] as const;

const VALIDATION_CHIPS = [
  { value: "25", label: "correct detections" },
  { value: "1", label: "false positive" },
  { value: "1", label: "missed detection" },
] as const;

const LIMITS = [
  {
    heading: "Best results",
    body: "Clear aerial views, open terrain and sparse vegetation.",
    className: "bg-sage-100 text-sage-900",
    headingClass: "text-sage-800",
  },
  {
    heading: "Manual review recommended",
    body: "Dense canopy, woodland boundaries, heavy occlusion or uncertain detections.",
    className: "bg-accent-100 text-accent-900",
    headingClass: "text-accent-800",
  },
  {
    heading: "Scope",
    body: "A research decision-support tool — not a replacement for professional wildlife assessment, and not an emergency warning service.",
    className: "bg-sand border border-divider text-[rgba(32,30,29,0.75)]",
    headingClass: "text-muted",
  },
] as const;

interface LiveRecord {
  detections: string;
  zones: string;
  meanConfidence: string;
}

/**
 * Live totals from the database. Rendered as a small supporting strip
 * rather than as headline claims — the headline numbers are the fixed
 * validation results above.
 */
async function fetchLiveRecord(): Promise<LiveRecord> {
  const empty: LiveRecord = {
    detections: "—",
    zones: "—",
    meanConfidence: "—",
  };

  try {
    const [detectionsResult, crossingsResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS count, AVG(confidence) AS avg_confidence
           FROM detections
          WHERE NOT (lat = 0 AND lng = 0)`
      ),
      pool.query(`SELECT COUNT(*) AS count FROM crossing_zones`),
    ]);

    const count = parseInt(detectionsResult.rows[0]?.count ?? "0", 10);
    const avgConfidence = detectionsResult.rows[0]?.avg_confidence
      ? parseFloat(detectionsResult.rows[0].avg_confidence)
      : 0;
    const zones = parseInt(crossingsResult.rows[0]?.count ?? "0", 10);

    return {
      detections: count.toLocaleString(),
      zones: zones.toLocaleString(),
      meanConfidence: avgConfidence ? avgConfidence.toFixed(2) : "—",
    };
  } catch (error) {
    console.error("[home] Failed to load live record:", error);
    return empty;
  }
}

export default async function Home() {
  const live = await fetchLiveRecord();

  return (
    <div className="animate-fade-in">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-night-panel text-night-text">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 78% 40%, rgba(122,138,94,.30), transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-8 hidden w-[500px] place-items-center opacity-95 lg:grid">
          <SriLankaGlyph tone="night" className="h-[500px] w-full" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-[730px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(240,233,217,0.10)] px-3.5 py-1.5 text-[11.5px] uppercase tracking-[0.06em] text-sage-300">
              <span className="block h-1.5 w-1.5 rounded-full bg-accent-400" />
              Research prototype · Dry Zone corridor, Sri Lanka
            </div>

            <h1 className="mt-6 font-heading text-[clamp(42px,7vw,74px)] leading-[0.98] tracking-[-0.03em] text-sand">
              Find the herd
              <br />
              before the
              <br />
              <span className="text-accent-400">village does.</span>
            </h1>

            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-[rgba(240,233,217,0.78)]">
              Upload geotagged aerial imagery. EleFind returns annotated
              detections with confidence scores, places each sighting on a
              shared conservation map, and warns the households nearest to it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/detect"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-sand transition-colors hover:bg-accent-600"
              >
                Upload a survey image
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/alerts"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(240,233,217,0.35)] px-6 py-3 text-[15px] font-semibold text-night-text transition-colors hover:bg-[rgba(240,233,217,0.1)]"
              >
                Get alerts near me
              </Link>
            </div>

            <dl className="mt-11 grid gap-8 border-t border-[rgba(240,233,217,0.14)] pt-6 sm:grid-cols-3">
              {HERO_FIGURES.map(({ value, caption, qualifier, size }) => (
                <div key={caption}>
                  <dt
                    className={`mono whitespace-pre-line text-sand ${size} leading-none`}
                  >
                    {value}
                  </dt>
                  <dd className="mt-2 text-[12.5px] leading-[1.45] text-[rgba(240,233,217,0.62)]">
                    {caption}
                    <span className="mt-0.5 block text-[11px] uppercase tracking-[0.06em] text-sage-400">
                      {qualifier}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── The problem ───────────────────────────────────────────── */}
      <section className="bg-sand px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h6 className="eyebrow m-0 mb-4 text-accent">The problem</h6>
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h2 className="m-0 max-w-[14ch] text-[clamp(28px,4vw,38px)] leading-[1.06]">
                One of Asia&rsquo;s deadliest borders is a field edge.
              </h2>
              <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.65] text-[rgba(32,30,29,0.72)]">
                Ground patrols cannot cover the corridor, so conflict is
                discovered after it happens. Aerial survey plus computer
                vision moves the discovery earlier.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="mono text-[clamp(40px,6vw,58px)] leading-[0.9] text-accent-700">
                  100+
                </div>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[rgba(32,30,29,0.7)]">
                  elephants killed per year in Sri Lanka
                </p>
              </div>
              <div>
                <div className="mono text-[clamp(40px,6vw,58px)] leading-[0.9] text-accent-700">
                  50+
                </div>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[rgba(32,30,29,0.7)]">
                  human lives lost to the same conflict
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why EleFind ───────────────────────────────────────────── */}
      <section className="bg-sand-surface px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h6 className="eyebrow m-0 mb-3.5 text-accent">Why EleFind?</h6>
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h2 className="m-0 max-w-[20ch] text-[clamp(28px,4vw,38px)] leading-[1.06]">
                Aerial detection that does more than draw boxes.
              </h2>
              <p className="mt-4.5 max-w-[52ch] text-[15px] leading-[1.65] text-[rgba(32,30,29,0.75)]">
                EleFind turns geotagged drone imagery into mapped elephant
                sightings through a browser-accessible workflow — aerial-image
                detection, geographic visualisation, confidence filtering,
                community-recorded crossing zones and proximity alerts in one
                platform.
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {CAPABILITIES.map(({ n, tone, text }) => (
                <div
                  key={n}
                  className="flex flex-col gap-2.5 rounded-card bg-sand p-5"
                >
                  <span
                    className={`mono grid h-[34px] w-[34px] place-items-center rounded-full text-xs ${
                      tone === "accent"
                        ? "bg-accent-200 text-accent-800"
                        : "bg-sage-200 text-sage-800"
                    }`}
                  >
                    {n}
                  </span>
                  <p className="m-0 text-[14.5px] font-semibold leading-[1.45]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Research evidence ─────────────────────────────────────── */}
      <section className="bg-sand px-4 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h6 className="eyebrow m-0 mb-3.5 text-accent">Research evidence</h6>
            <h2 className="m-0 max-w-[22ch] text-[clamp(26px,3.5vw,34px)] leading-[1.08]">
              Preliminary end-to-end validation
            </h2>
            <p className="mt-4.5 max-w-[50ch] text-[15px] leading-[1.65] text-[rgba(32,30,29,0.75)]">
              In six geotagged drone images containing 26 human-annotated
              elephants, EleFind produced 25 correct detections, one false
              positive and one missed detection — confirming the complete
              image-to-map workflow as a functional research prototype.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {VALIDATION_CHIPS.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-[22px] bg-sand-surface px-[18px] py-3.5"
                >
                  <div className="mono text-[26px]">{value}</div>
                  <div className="mt-0.5 text-[11.5px] text-[rgba(32,30,29,0.6)]">
                    {label}
                  </div>
                </div>
              ))}
              <div className="max-w-[26ch] rounded-[22px] bg-sage-100 px-[18px] py-3.5">
                <span className="inline-flex items-center rounded-full bg-sage-200 px-2.5 py-0.5 text-[11px] font-semibold text-sage-800">
                  Preliminary
                </span>
                <p className="mt-2 text-[11.5px] leading-[1.45] text-sage-900">
                  Sample too small to generalise — not a field-accuracy claim.
                </p>
              </div>
            </div>

            {/* Live totals — supporting detail, deliberately not the headline. */}
            <dl className="mono mt-6 flex flex-wrap gap-x-7 gap-y-2 border-t border-divider pt-5 text-[12px] text-[rgba(32,30,29,0.6)]">
              <div>
                <dt className="inline">detections recorded </dt>
                <dd className="inline text-[15px] text-ink">
                  {live.detections}
                </dd>
              </div>
              <div>
                <dt className="inline">crossing zones </dt>
                <dd className="inline text-[15px] text-ink">{live.zones}</dd>
              </div>
              <div>
                <dt className="inline">mean confidence </dt>
                <dd className="inline text-[15px] text-ink">
                  {live.meanConfidence}
                </dd>
              </div>
            </dl>
          </div>

          <AnnotatedFramePlaceholder />
        </div>
      </section>

      {/* ─── Explainability ────────────────────────────────────────── */}
      <section className="bg-night-panel px-4 py-14 text-night-text sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h6 className="eyebrow m-0 mb-3.5 text-accent-400">Explainability</h6>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <h2 className="m-0 max-w-[20ch] text-[clamp(26px,3.5vw,34px)] leading-[1.08] text-sand">
                Detection you can visually inspect
              </h2>
              <p className="mt-4.5 max-w-[46ch] text-[15px] leading-[1.65] text-[rgba(240,233,217,0.75)]">
                Explainability visualisations show the model concentrating on
                visible elephant body regions rather than unrelated background
                features such as vegetation, water, bare ground or shadows.
              </p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7f8464] to-[#5c6349]">
                <span className="absolute left-[26%] top-[32%] w-[22%] rounded-[4px] border-2 border-accent-400 pb-[18.3%]" />
                <span className="absolute left-[56%] top-[54%] w-[18%] rounded-[4px] border-2 border-accent-400 pb-[15%]" />
                <span className="mono absolute bottom-2.5 left-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                  detection
                </span>
              </div>
              <div
                className="relative aspect-square overflow-hidden rounded-[24px]"
                style={{
                  background:
                    "radial-gradient(22% 22% at 35% 42%, #ffd6a0, rgba(214,127,72,.65) 45%, transparent 72%), radial-gradient(18% 18% at 64% 62%, #ffc6a5, rgba(214,127,72,.5) 45%, transparent 72%), linear-gradient(120deg, #3d472b, #272e1b)",
                }}
              >
                <span className="mono absolute bottom-2.5 left-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                  Grad-CAM · placeholder
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community alerts ──────────────────────────────────────── */}
      <section className="bg-accent-100 px-4 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h6 className="eyebrow m-0 mb-3.5 text-accent-800">
              Community alerts
            </h6>
            <h2 className="m-0 max-w-[22ch] text-[clamp(26px,3.5vw,34px)] leading-[1.08]">
              Live near the corridor? Ask to be warned.
            </h2>
            <p className="mt-4.5 max-w-[50ch] text-[15px] leading-[1.65] text-accent-900">
              Register the area you live in and pick a radius. When an officer
              verifies a sighting inside it, EleFind sends an SMS in your
              language — with what was seen, how far away, and what to do next.
              Your home location is stored coarsely and never shown on the
              public map.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/alerts"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-[22px] py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-accent-600"
              >
                Register my area
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/alerts"
                className="inline-flex items-center gap-2 rounded-full border border-divider px-[22px] py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-[rgba(32,30,29,0.07)]"
              >
                See a sample alert
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex-1 rounded-card bg-sand p-[18px]">
              <div className="mono text-[10.5px] uppercase tracking-[0.08em] text-[rgba(32,30,29,0.5)]">
                SMS · 18:26
              </div>
              <p className="m-0 mt-2 text-[13.5px] leading-[1.55]">
                EleFind: 4 elephants seen ~3 km north-east of Hingurakgoda at
                18:24. Avoid the Minneriya road tonight. Reply STOP to
                unsubscribe.
              </p>
            </div>
            <div className="flex w-[150px] flex-none flex-col gap-2.5">
              <div className="rounded-[22px] bg-sand p-3.5">
                <div className="mono text-[22px]">SMS</div>
                <div className="mt-0.5 text-[11px] text-[rgba(32,30,29,0.6)]">
                  in Sinhala, Tamil or English
                </div>
              </div>
              <div className="rounded-[22px] bg-sand p-3.5">
                <div className="mono flex items-center gap-1.5 text-[15px]">
                  <Lock className="h-3.5 w-3.5" />
                  5 km grid
                </div>
                <div className="mt-0.5 text-[11px] text-[rgba(32,30,29,0.6)]">
                  home location stored coarsely
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Honest limits ─────────────────────────────────────────── */}
      <section className="bg-sand-surface px-4 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {LIMITS.map(({ heading, body, className, headingClass }) => (
            <div key={heading} className={`rounded-card p-[22px] ${className}`}>
              <h6 className={`eyebrow m-0 mb-2.5 ${headingClass}`}>{heading}</h6>
              <p className="m-0 text-sm leading-[1.55]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Stand-in for the annotated survey frame.
 *
 * Replace the gradient block with the real annotated output once a
 * representative frame is cleared for publication.
 */
function AnnotatedFramePlaceholder() {
  const boxes = [
    { left: "16%", top: "30%", width: "12%", color: "#f6a06b" },
    { left: "38%", top: "52%", width: "11%", color: "#f6a06b" },
    { left: "57%", top: "24%", width: "10%", color: "#f6a06b" },
    { left: "73%", top: "58%", width: "9%", color: "#ffc6a5" },
  ];

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[28px]"
      style={{
        background: "linear-gradient(120deg, #8b8f6c, #5c6349 50%, #777c5c)",
        filter: "saturate(0.6) contrast(0.85) brightness(1.1) opacity(0.94)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 20%), repeating-linear-gradient(0deg, rgba(255,255,255,.045) 0 1px, transparent 1px 25%)",
        }}
      />
      {boxes.map(({ left, top, width, color }) => (
        <span
          key={`${left}-${top}`}
          className="absolute rounded-[4px] border-2"
          style={{
            left,
            top,
            width,
            paddingBottom: `calc(${width} / 1.2)`,
            borderColor: color,
          }}
        />
      ))}
      <span className="mono absolute bottom-3 left-3.5 rounded-full bg-black/40 px-2.5 py-1 text-[10.5px] text-white/85">
        placeholder — drop the real annotated survey frame here
      </span>
    </div>
  );
}
