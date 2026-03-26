"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  MapPinned,
  Users,
  ArrowLeft,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  disabled?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/detections", label: "Detections", icon: ScanSearch },
  { href: "/admin/crossings", label: "Crossing Zones", icon: MapPinned },
  { href: "/admin/users", label: "Officers", icon: Users, disabled: true },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <ul className="flex-1 p-2 space-y-0.5">
        {ADMIN_NAV.map(({ href, label, icon: Icon, disabled, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          if (disabled) {
            return (
              <li key={href}>
                <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-green-700 cursor-not-allowed select-none">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                  <span className="ml-auto text-[10px] bg-green-800 text-green-400 rounded px-1.5 py-0.5 font-medium">
                    Soon
                  </span>
                </div>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-700 text-white"
                    : "text-green-200 hover:bg-green-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-2 border-t border-green-800">
        <Link
          href="/map"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-green-400 hover:text-green-200 hover:bg-green-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to app
        </Link>
      </div>
    </nav>
  );
}
