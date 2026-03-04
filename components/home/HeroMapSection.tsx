"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

/**
 * Hero section map background with a left-to-right fade.
 *
 * The Leaflet map is positioned absolutely on the right side of the hero.
 * A CSS gradient overlay fades the map from full opacity on the right
 * to fully transparent (revealing the green-900 background) on the left.
 *
 * Clicking anywhere on the visible map area navigates to /map.
 * On mobile, the map is shown below the text with a top fade instead.
 */

const HeroMap = dynamic(() => import("@/components/map/HeroMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-green-900" />
  ),
});

export default function HeroMapSection() {
  return (
    <>
      {/* Map container — positioned behind text */}
      <div className="absolute inset-0 z-0">
        <HeroMap />
      </div>

      {/* Gradient overlay: fades map from right → left
          On the left ~60% the map is hidden behind green-900,
          revealing the text area. On the right it's semi-transparent
          to show the map through a dark tint. */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(
            to right,
            #1a3d2b 0%,
            #1a3d2b 35%,
            rgba(26, 61, 43, 0.85) 55%,
            rgba(26, 61, 43, 0.5) 75%,
            rgba(26, 61, 43, 0.3) 100%
          )`,
        }}
      />

      {/* Clickable map overlay — only on the right portion
          This sits above the gradient but below the text (z-[5] vs z-10).
          It covers the right half where the map is visible. */}
      <Link
        href="/map"
        className="absolute top-0 right-0 z-[5] hidden lg:block"
        style={{ width: "50%", height: "100%" }}
        aria-label="Open interactive map"
      >
        {/* Subtle hover effect */}
        <div className="h-full w-full transition-colors duration-300 hover:bg-green-900/10" />
      </Link>

      {/* Mobile: small "Explore Map" hint at bottom of hero */}
      <div className="absolute bottom-4 right-4 z-[5] lg:hidden">
        <Link
          href="/map"
          className="rounded-lg bg-green-700/70 px-3 py-1.5 text-xs font-medium text-green-100 backdrop-blur-sm transition-colors hover:bg-green-700/90"
        >
          Explore Map →
        </Link>
      </div>
    </>
  );
}
