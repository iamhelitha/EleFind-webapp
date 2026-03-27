import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Map, Users, Camera, ArrowRight, Activity, Radar } from "lucide-react";
import Card from "@/components/ui/Card";
import HeroMapSection from "@/components/home/HeroMapSection";
import pool from "@/lib/db";

/**
 * Landing page for EleFind.
 *
 * Sections:
 *  1. Hero — text on left, interactive fading map on right (clickable → /map)
 *  2. Problem statement — human-elephant conflict in Sri Lanka
 *  3. Feature cards — Detect, Map, Contribute
 *  4. Stats counter (fetched from database)
 *  5. Call to action
 */

const FEATURES = [
  {
    icon: Camera,
    title: "Detect",
    description:
      "Upload aerial or drone imagery and let our YOLOv11 + SAHI pipeline detect elephants with high accuracy — even in dense vegetation.",
    href: "/detect",
    color: "text-green-700",
  },
  {
    icon: Map,
    title: "Map",
    description:
      "Visualise detections on an interactive map. Track elephant movement patterns and identify hotspots across the landscape.",
    href: "/map",
    color: "text-amber-500",
  },
  {
    icon: Users,
    title: "Crossing Zones",
    description:
      "Mark and manage elephant crossing zones with risk-level classification. Help wildlife officers plan safer corridors.",
    href: "/crossings",
    color: "text-risk-high",
  },
] as const;

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

async function fetchStats(): Promise<Stat[]> {
  try {
    // Fetch detection count and average confidence
    const detectionsResult = await pool.query(
      `SELECT COUNT(*) as count, AVG(confidence) as avg_confidence
       FROM detections
       WHERE NOT (lat = 0 AND lng = 0)`
    );

    const detectionCount = parseInt(detectionsResult.rows[0]?.count ?? "0", 10);
    const avgConfidence = detectionsResult.rows[0]?.avg_confidence
      ? parseFloat(detectionsResult.rows[0].avg_confidence)
      : 0;

    // Fetch crossing zones count
    const crossingsResult = await pool.query(
      `SELECT COUNT(*) as count FROM crossing_zones`
    );

    const crossingCount = parseInt(crossingsResult.rows[0]?.count ?? "0", 10);

    return [
      {
        label: "Detections Made",
        value: detectionCount.toLocaleString(),
        icon: Radar,
      },
      {
        label: "Crossing Zones Mapped",
        value: crossingCount.toLocaleString(),
        icon: Map,
      },
      {
        label: "Avg. Confidence",
        value: `${(avgConfidence * 100).toFixed(1)}%`,
        icon: Activity,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    // Return empty stats on error instead of hardcoded values
    return [
      { label: "Detections Made", value: "—", icon: Radar },
      { label: "Crossing Zones Mapped", value: "—", icon: Map },
      { label: "Avg. Confidence", value: "—", icon: Activity },
    ];
  }
}

export default async function Home() {
  const stats = await fetchStats();
  return (
    <div className="animate-fade-in">
      {/* ─── Hero with Map Background ────────────────────────── */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        {/* Map fills the right side, fades to green-900 on the left */}
        <HeroMapSection />

        {/* Text content overlaid on the left */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Logo + pill */}
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/brand/elefind-logo.png"
                alt="EleFind logo"
                width={44}
                height={44}
                className="rounded-lg drop-shadow-lg"
                priority
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700/60 px-3.5 py-1 text-xs font-semibold tracking-wide text-green-100 backdrop-blur-sm">
                <Radar className="h-3.5 w-3.5" />
                AI-Powered Conservation
              </span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Detect &amp; Map{" "}
              <span className="text-amber-500">Elephants</span>{" "}
              from the Sky
            </h1>

            <p className="mt-6 text-base leading-relaxed text-green-100/90 sm:text-lg lg:text-xl">
              EleFind uses YOLOv11 and SAHI slice-aided inference to detect
              elephants in aerial imagery, helping mitigate human-elephant
              conflict in Sri Lanka through better monitoring and spatial awareness.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/detect"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-green-900 shadow-lg transition-all hover:bg-amber-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                Try Detection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-green-300/40 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700/50 hover:border-green-300/70"
              >
                View Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Problem Statement ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-green-900 sm:text-3xl">
            Human-Elephant Conflict Is Growing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Sri Lanka has one of the highest rates of human-elephant conflict
            in Asia, with over 100 elephant and 50 human deaths annually.
            Traditional monitoring relies on manual ground patrols that cannot
            scale. EleFind brings computer vision to aerial surveillance,
            enabling faster detection, better spatial awareness, and
            data-driven conservation planning.
          </p>
        </div>
      </section>

      {/* ─── Feature Cards ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, href, color }) => (
            <Link key={title} href={href} className="group">
              <Card className="flex h-full flex-col p-6 transition-transform group-hover:-translate-y-1">
                <Icon className={`h-10 w-10 ${color} mb-4`} />
                <h3 className="font-heading text-lg font-bold text-green-900">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-700 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="bg-green-100/50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <Icon className="h-8 w-8 text-green-700 mb-2" />
                <span className="font-heading text-3xl font-bold text-green-900">
                  {value}
                </span>
                <span className="mt-1 text-sm text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 sm:text-3xl">
          Ready to Help Protect Elephants?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Upload an aerial image, detect elephants in seconds, and contribute
          sighting data to the conservation map.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            href="/detect"
            className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-900"
          >
            Start Detecting
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-green-700 px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-100"
          >
            View Map
          </Link>
        </div>
      </section>
    </div>
  );
}
