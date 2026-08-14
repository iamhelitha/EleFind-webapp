/**
 * The EleFind ring mark — a terracotta disc with a punched-out ring,
 * echoing a detection pin over ground.
 *
 * `ringColor` must match whatever the mark sits on, since the ring is
 * cut out of the disc rather than drawn in its own colour.
 */

interface BrandMarkProps {
  /** Outer diameter in pixels. */
  size?: number;
  /** Background the mark sits on, used for the punched-out ring. */
  ringColor?: string;
  className?: string;
}

export default function BrandMark({
  size = 30,
  ringColor = "var(--sand)",
  className = "",
}: BrandMarkProps) {
  // The ring inset and stroke scale with the mark so it reads the same
  // at 26px in a page header as it does at 44px in the hero.
  const inset = size * 0.3;
  const stroke = Math.max(1.5, size * 0.067);

  return (
    <span
      aria-hidden="true"
      className={`relative inline-block flex-none rounded-full bg-accent ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute rounded-full"
        style={{
          inset,
          border: `${stroke}px solid ${ringColor}`,
        }}
      />
    </span>
  );
}
