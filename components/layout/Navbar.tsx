"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * Top navigation bar with responsive mobile menu.
 * Uses the EleFind forest-green palette and Syne heading font.
 */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/detect", label: "Detect" },
  { href: "/map", label: "Map" },
  { href: "/crossings", label: "Crossings" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-card-bg/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/brand/elefind-logo.png"
            alt="EleFind logo"
            width={28}
            height={28}
            className="rounded-sm"
            priority
          />
          <span className="font-heading text-xl font-bold tracking-tight text-green-900">
            EleFind
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${active
                      ? "bg-green-100 text-green-900"
                      : "text-muted hover:bg-green-100/60 hover:text-green-900"
                    }
                  `}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-green-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-card-border bg-card-bg md:hidden animate-fade-in">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      block rounded-lg px-3 py-2 text-sm font-medium transition-colors
                      ${active
                        ? "bg-green-100 text-green-900"
                        : "text-muted hover:bg-green-100/60 hover:text-green-900"
                      }
                    `}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
