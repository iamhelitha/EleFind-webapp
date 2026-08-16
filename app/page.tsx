import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Rocket, ScanSearch } from "lucide-react";
import pool from "@/lib/db";

/**
 * Landing page for EleFind.
 *
 * Sections, following the redesign:
 *  1. Hero on the ink ground — research framing, not vanity counters
 *  2. The problem — human-elephant conflict in Sri Lanka
 *  3. Why EleFind — four capability cards
 *  4. Model previews — concise links to the full model reports
 *  5. Explainability — detection beside Grad-CAM
 *  6. Community alerts band
 *  7. Honest limits — best results / manual review / scope
 */

const HERO_FIGURES = [
  {
    value: "Survey image",
    caption: "Upload a geotagged aerial photograph",
    qualifier: "Browser based",
    size: "text-[18px]",
  },
  {
    value: "AI detection",
    caption: "Review boxes and confidence scores",
    qualifier: "Human verified",
    size: "text-[18px]",
  },
  {
    value: "Map + alert",
    caption: "Place verified sightings on the shared map",
    qualifier: "Conservation workflow",
    size: "text-[18px]",
  },
] as const;

const CAPABILITIES = [
  { n: "01", tone: "accent", text: "Browser-based — nothing to install locally" },
  { n: "02", tone: "accent", text: "Built specifically for aerial and drone imagery" },
  { n: "03", tone: "sage", text: "Converts geotagged detections into map locations" },
  { n: "04", tone: "sage", text: "Warns nearby households when a sighting is verified" },
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
        <div className="absolute inset-0">
          <Image
            src="/images/research/hero-aerial.jpg"
            alt="Aerial wildlife survey terrain"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,29,22,0.98)_0%,rgba(25,29,22,0.94)_38%,rgba(25,29,22,0.68)_68%,rgba(25,29,22,0.34)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(75%_90%_at_80%_35%,rgba(122,138,94,0.16),transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-[730px]">
            <h1 className="font-heading text-[clamp(42px,7vw,74px)] leading-[0.98] tracking-[-0.03em] text-sand">
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
                <span className="mono rounded-full bg-[rgba(174,191,146,0.2)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em] text-sage-300">
                  Soon
                </span>
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

      {/* ─── Model previews ───────────────────────────────────────── */}
      <section className="bg-sand px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h6 className="eyebrow m-0 mb-3.5 text-accent">Detection models</h6>
              <h2 className="m-0 max-w-[22ch] text-[clamp(28px,4vw,38px)] leading-[1.06]">
                Two generations, documented in full.
              </h2>
              <p className="mt-4 max-w-[66ch] text-[14.5px] leading-[1.65] text-muted">
                The landing page now keeps the results brief. Each model has a
                dedicated report with its evaluation protocol, training figures,
                comparison graphs, inference settings and known limitations.
              </p>
            </div>
            <dl className="mono flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted">
              <div>
                <dt className="inline">detections </dt>
                <dd className="inline text-[14px] text-ink">{live.detections}</dd>
              </div>
              <div>
                <dt className="inline">crossing zones </dt>
                <dd className="inline text-[14px] text-ink">{live.zones}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[28px] bg-night-panel p-6 text-night-text sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.12em] text-sage-400">
                    Deployed research model
                  </div>
                  <h3 className="mt-2 text-[28px] text-sand">EleFind YOLO11</h3>
                </div>
                <ScanSearch className="h-7 w-7 text-accent-400" />
              </div>
              <p className="mt-4 max-w-[58ch] text-[13px] leading-[1.6] text-night-muted">
                The original aerial detector, evaluated on a 50-image test set
                and paired with tiled inference for small elephants in large
                survey photographs.
              </p>
              <div className="mt-5 flex gap-5 border-y border-white/10 py-4">
                <div>
                  <div className="mono text-xl text-sand">84.3%</div>
                  <div className="mt-1 text-[10.5px] text-night-muted">mAP@0.5</div>
                </div>
                <div>
                  <div className="mono text-xl text-sand">50</div>
                  <div className="mt-1 text-[10.5px] text-night-muted">test images</div>
                </div>
              </div>
              <Link
                href="/models/yolo11"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
              >
                Read the YOLO11 report <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            <article className="rounded-[28px] bg-sage-100 p-6 text-sage-900 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="mono text-[10px] uppercase tracking-[0.12em] text-accent-700">
                    Evaluation complete · launch ready
                  </div>
                  <h3 className="mt-2 text-[28px]">EleFind YOLO26s</h3>
                </div>
                <Rocket className="h-7 w-7 text-accent-700" />
              </div>
              <p className="mt-4 max-w-[58ch] text-[13px] leading-[1.6] text-sage-900/70">
                The next-generation detector, evaluated on 439 held-out
                full-resolution images with point-based metrics and a direct
                YOLO11s baseline comparison.
              </p>
              <div className="mt-5 flex gap-5 border-y border-sage-300/60 py-4">
                <div>
                  <div className="mono text-xl">0.9002</div>
                  <div className="mt-1 text-[10.5px] text-sage-900/60">point AP</div>
                </div>
                <div>
                  <div className="mono text-xl">439</div>
                  <div className="mt-1 text-[10.5px] text-sage-900/60">test images</div>
                </div>
              </div>
              <Link
                href="/models/yolo26"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-700 transition-colors hover:text-accent"
              >
                Read the YOLO26 report <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </div>
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
              <div className="relative aspect-[3/2] overflow-hidden rounded-[24px] bg-[#5c6349]">
                <Image
                  src="/images/research/detection-output.jpg"
                  alt="EleFind detection output with bounding boxes around two elephants"
                  fill
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="object-cover"
                />
                <span className="mono absolute bottom-2.5 left-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                  Detection output
                </span>
              </div>
              <div className="relative aspect-[3/2] overflow-hidden rounded-[24px] bg-[#272e1b]">
                <Image
                  src="/images/research/gradcam.jpg"
                  alt="Grad-CAM heatmap highlighting the regions used for elephant detection"
                  fill
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="object-cover"
                />
                <span className="mono absolute bottom-2.5 left-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                  Grad-CAM activation
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
            <h6 className="eyebrow m-0 mb-3.5 flex items-center gap-2 text-accent-800">
              Community alerts
              <span className="mono rounded-full bg-sage-200 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em] text-sage-800">
                Coming soon
              </span>
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
