"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { useAppAuth } from "@/components/providers/AuthProvider";
import BrandMark from "@/components/brand/BrandMark";

/**
 * Top navigation bar with responsive mobile menu.
 *
 * The bar adopts the night ground on the detect route so the chrome reads
 * as operations tooling, and the sand ground everywhere else — including
 * /map, whose basemap and panels are light. Shows an "Admin" link only for
 * authenticated officers, and flags Alerts as not yet live.
 */

const NAV_LINKS = [
  { href: "/detect", label: "Detect", comingSoon: false },
  { href: "/map", label: "Map", comingSoon: false },
  { href: "/alerts", label: "Alerts", comingSoon: true },
] as const;

/** Routes that render on the ink ground and want matching chrome. */
const NIGHT_ROUTES = ["/detect"] as const;

/** Short label shown beside the wordmark on operations routes. */
const ROUTE_TAG: Record<string, string> = {
  "/map": "MAP",
  "/detect": "DETECT",
  "/admin": "OPS",
};

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAppAuth();
  const isOfficer = user?.role === "officer";

  const isNight = NIGHT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const routeTag = ROUTE_TAG[pathname];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const linkClass = (href: string) => {
    const active = isActive(href);
    if (isNight) {
      return `rounded-full px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[rgba(240,233,217,0.12)] text-sage-300"
          : "text-[rgba(240,233,217,0.7)] hover:text-night-text"
      }`;
    }
    return `rounded-full px-3 py-1.5 text-sm transition-colors ${
      active
        ? "bg-accent-200 text-accent-800"
        : "text-muted hover:bg-[rgba(32,30,29,0.06)] hover:text-ink"
    }`;
  };

  const headerClass = isNight
    ? "sticky top-0 z-50 bg-night-panel text-night-text"
    : "sticky top-0 z-50 border-b border-divider bg-sand/90 backdrop-blur-md";

  return (
    <header className={headerClass}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={26} />
          <span className="font-heading text-[21px] tracking-[-0.025em] sm:text-[22px]">
            EleFind
          </span>
          {routeTag && (
            <span
              className={`mono ml-1 hidden rounded-full px-2 py-0.5 text-[11px] sm:inline ${
                isNight
                  ? "bg-[rgba(240,233,217,0.12)] text-sage-300"
                  : "bg-accent-200 text-accent-800"
              }`}
            >
              {routeTag}
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, comingSoon }) => (
            <li key={href}>
              <Link href={href} className={linkClass(href)}>
                {label}
                {comingSoon && (
                  <span
                    className={`mono ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em] ${
                      isNight
                        ? "bg-[rgba(174,191,146,0.2)] text-sage-300"
                        : "bg-sage-200 text-sage-800"
                    }`}
                  >
                    Soon
                  </span>
                )}
              </Link>
            </li>
          ))}
          {isOfficer && (
            <li>
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
              </Link>
            </li>
          )}
          <li
            className={`ml-2 border-l pl-3 ${
              isNight ? "border-[rgba(240,233,217,0.16)]" : "border-divider"
            }`}
          >
            {user ? (
              <div className="flex items-center gap-3">
                <span
                  className={`mono hidden text-[11.5px] lg:inline ${
                    isNight ? "text-[rgba(240,233,217,0.55)]" : "text-muted"
                  }`}
                >
                  {user.name ?? user.email}
                  {isOfficer ? " · officer" : " · community member"}
                </span>
                <button
                  onClick={() => void signOut()}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isNight
                      ? "border-[rgba(240,233,217,0.3)] text-night-text hover:bg-[rgba(240,233,217,0.1)]"
                      : "border-divider text-muted hover:bg-[rgba(32,30,29,0.07)] hover:text-ink"
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isNight
                    ? "border border-[rgba(240,233,217,0.3)] text-night-text hover:bg-[rgba(240,233,217,0.1)]"
                    : "bg-accent text-sand hover:bg-accent-600"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className={`inline-flex cursor-pointer items-center justify-center rounded-full p-2 md:hidden ${
            isNight
              ? "text-night-text hover:bg-[rgba(240,233,217,0.1)]"
              : "text-muted hover:bg-[rgba(32,30,29,0.07)]"
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          className={`animate-fade-in md:hidden ${
            isNight
              ? "border-t border-[rgba(240,233,217,0.14)] bg-night-panel"
              : "border-t border-divider bg-sand"
          }`}
        >
          <ul className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map(({ href, label, comingSoon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block ${linkClass(href)}`}
                >
                  {label}
                  {comingSoon && (
                    <span
                      className={`mono ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em] ${
                        isNight
                          ? "bg-[rgba(174,191,146,0.2)] text-sage-300"
                          : "bg-sage-200 text-sage-800"
                      }`}
                    >
                      Soon
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {isOfficer && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={`block ${linkClass("/admin")}`}
                >
                  Admin
                </Link>
              </li>
            )}
            <li
              className={`mt-1 border-t pt-3 ${
                isNight ? "border-[rgba(240,233,217,0.14)]" : "border-divider"
              }`}
            >
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`mono truncate text-[11.5px] ${
                      isNight ? "text-[rgba(240,233,217,0.55)]" : "text-muted"
                    }`}
                  >
                    {user.name ?? user.email}
                  </span>
                  <button
                    onClick={() => {
                      void signOut();
                      setMenuOpen(false);
                    }}
                    className={`flex flex-none cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      isNight
                        ? "border-[rgba(240,233,217,0.3)] text-night-text"
                        : "border-divider text-muted"
                    }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
                    isNight
                      ? "border border-[rgba(240,233,217,0.3)] text-night-text"
                      : "bg-accent text-sand"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
