import Image from "next/image";

/**
 * The EleFind logo mark, used in the navbar, footer, and auth screens.
 *
 * `ringColor` is accepted for backward compatibility with call sites that
 * still pass it (it no longer does anything — the mark is a fixed image,
 * not a drawn shape that needs to match its background).
 */

interface BrandMarkProps {
  /** Outer diameter in pixels. */
  size?: number;
  /** @deprecated no longer used — kept so existing call sites don't break. */
  ringColor?: string;
  className?: string;
}

export default function BrandMark({
  size = 30,
  className = "",
}: BrandMarkProps) {
  return (
    <Image
      src="/brand/elefind-logo.png"
      alt="EleFind logo"
      width={size}
      height={size}
      className={`flex-none rounded-lg ${className}`}
      priority
    />
  );
}
