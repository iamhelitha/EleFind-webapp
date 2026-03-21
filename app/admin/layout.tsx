import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/detections", label: "Detections", icon: "🐘" },
  { href: "/admin/crossings", label: "Crossing Zones", icon: "⬡" },
  { href: "/admin/users", label: "Officers", icon: "👤", disabled: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "officer") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-green-900 text-green-100">
        <div className="p-4 border-b border-green-800">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
            Admin Panel
          </p>
          <p className="text-sm text-green-200 mt-1 truncate">
            {session.user.name ?? session.user.email}
          </p>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV.map(({ href, label, icon, disabled }) =>
            disabled ? (
              <div
                key={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-600 cursor-not-allowed"
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="ml-auto text-xs">Soon</span>
              </div>
            ) : (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-200 hover:bg-green-800 hover:text-white transition-colors"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            )
          )}
        </nav>
        <div className="p-3 border-t border-green-800 mt-auto">
          <Link
            href="/crossings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-green-400 hover:text-green-200 transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  );
}
