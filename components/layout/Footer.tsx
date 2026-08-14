import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";

/**
 * Site footer.
 *
 * Carries the scope disclaimer the design calls for on every surface:
 * EleFind is research decision support, not an emergency service.
 */

export default function Footer() {
  return (
    <footer className="bg-night-panel text-night-text">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark size={28} ringColor="var(--night-panel)" />
              <span className="font-heading text-[18px]">EleFind</span>
            </div>
            <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-[rgba(240,233,217,0.6)]">
              Aerial elephant detection and mapping for the Sri Lankan dry-zone
              corridor. A research decision-support tool — not a replacement for
              professional wildlife assessment, and not an emergency warning
              service.
            </p>
          </div>

          <div>
            <h6 className="eyebrow m-0 text-[rgba(240,233,217,0.5)]">
              Platform
            </h6>
            <ul className="mt-3 flex flex-col gap-2 text-[13.5px]">
              <li>
                <Link
                  href="/detect"
                  className="text-[rgba(240,233,217,0.75)] transition-colors hover:text-accent-400"
                >
                  Detect
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-[rgba(240,233,217,0.75)] transition-colors hover:text-accent-400"
                >
                  Map
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[rgba(240,233,217,0.75)] transition-colors hover:text-accent-400"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="eyebrow m-0 text-[rgba(240,233,217,0.5)]">
              In an emergency
            </h6>
            <p className="mono mt-3 text-[13.5px] leading-relaxed text-[rgba(240,233,217,0.75)]">
              DWC hotline
              <br />
              <span className="text-[22px] text-accent-400">1919</span>
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col items-start gap-3 border-t border-[rgba(240,233,217,0.12)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono m-0 text-[11px] text-[rgba(240,233,217,0.45)]">
            &copy; {new Date().getFullYear()} EleFind · BSc Computer Science
            Dissertation · University of Bedfordshire
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/iamhelitha"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[rgba(240,233,217,0.7)] transition-colors hover:text-accent-400"
            >
              <Github className="h-4 w-4" />
              iamhelitha
            </a>
            <a
              href="https://linkedin.com/in/iamhelitha"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[rgba(240,233,217,0.7)] transition-colors hover:text-accent-400"
            >
              <Linkedin className="h-4 w-4" />
              iamhelitha
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
