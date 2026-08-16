import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";
import SriLankaGlyph from "@/components/brand/SriLankaGlyph";

/**
 * Split-screen frame shared by sign in, sign up and password reset.
 *
 * The left panel sits on the ink ground and carries the trust story;
 * the right panel is the sand-ground form surface. On narrow screens the
 * ink panel collapses away so the form gets the whole viewport.
 */

const TRUST_POINTS = [
  "84.3% mAP@0.5 · research validation",
  "Home locations stored on a 5 km grid",
  "Single frame? No account needed",
] as const;

interface AuthShellProps {
  /** Small uppercase label above the form heading, e.g. "Sign in". */
  kicker: string;
  /** Form heading. */
  heading: string;
  /** Optional supporting line under the heading. */
  description?: string;
  children: React.ReactNode;
  /** Rendered under the form card — links, alternate actions. */
  footer?: React.ReactNode;
}

export default function AuthShell({
  kicker,
  heading,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="animate-fade-in bg-night px-0 py-0 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden bg-night-panel sm:rounded-panel lg:grid-cols-[480px_1fr]">
        {/* ── Trust panel ─────────────────────────────────────────── */}
        <aside className="relative hidden flex-col overflow-hidden p-8 text-night-text lg:flex">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 60% at 30% 30%, rgba(122,138,94,.28), transparent 70%)",
            }}
          />
          <div className="pointer-events-none absolute -bottom-10 -right-32 opacity-50">
            <SriLankaGlyph tone="night" showGrid={false} className="h-[620px]" />
          </div>

          <Link href="/" className="relative flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="font-heading text-[19px]">EleFind</span>
          </Link>

          <div className="relative mt-auto">
            <h2 className="m-0 max-w-[16ch] font-heading text-[40px] leading-[1.04] text-sand">
              Two accounts, two levels of trust.
            </h2>
            <p className="mt-4.5 max-w-[40ch] text-[14.5px] leading-[1.65] text-[rgba(240,233,217,0.72)]">
              Community members register their area, receive alerts and confirm
              zones. Wildlife officers verify records and see precise
              coordinates — access is logged.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-[13px] text-[rgba(240,233,217,0.8)]"
                >
                  <span className="mono grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[rgba(174,191,146,0.25)] text-[10px] text-sage-300">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Form surface ────────────────────────────────────────── */}
        <div className="flex items-center justify-center bg-sand p-5 sm:p-9">
          <div className="w-full max-w-[440px]">
            <Link
              href="/"
              className="mb-6 flex items-center gap-2.5 lg:hidden"
            >
              <BrandMark size={28} />
              <span className="font-heading text-[18px]">EleFind</span>
            </Link>

            <div className="flex flex-col gap-3.5 rounded-panel bg-sand-surface p-6 sm:p-7">
              <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-[rgba(32,30,29,0.5)]">
                {kicker}
              </span>
              <h1 className="m-0 text-[27px]">{heading}</h1>
              {description && (
                <p className="m-0 text-[13.5px] leading-[1.55] text-[rgba(32,30,29,0.7)]">
                  {description}
                </p>
              )}
              {children}
            </div>

            {footer && (
              <div className="mt-4 text-center text-[12.5px] text-[rgba(32,30,29,0.6)]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
