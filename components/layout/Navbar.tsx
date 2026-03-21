"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";

/**
 * Top navigation bar with responsive mobile menu.
 * Shows an "Admin" link only for authenticated officers.
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
  const { data: session } = useSession();
  const isOfficer = session?.user?.role === "officer";

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/") && href !== "/";
    return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-green-100 text-green-900"
        : "text-muted hover:bg-green-100/60 hover:text-green-900"
    }`;
  };

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
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={linkClass(href)}>
                {label}
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
          <li className="ml-2 pl-2 border-l border-card-border">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <User className="h-3.5 w-3.5" />
                  {session.user.name ?? session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-2 text-xs font-medium text-muted hover:border-green-300 hover:text-green-900 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center gap-1.5 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </button>
            )}
          </li>
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
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`block ${linkClass(href)}`}
                >
                  {label}
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
            <li className="pt-2 border-t border-card-border mt-1">
              {session?.user ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <User className="h-3.5 w-3.5" />
                    {session.user.name ?? session.user.email}
                  </span>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                    className="flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-2 text-xs font-medium text-muted hover:border-green-300 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { signIn(); setMenuOpen(false); }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
