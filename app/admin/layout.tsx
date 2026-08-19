import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/server-auth";
import AdminSidebarNav from "./_components/AdminSidebarNav";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Administration",
  description: "Restricted EleFind administration interface.",
  path: "/admin",
  index: false,
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerAuthUser();

  if (!user || user.role !== "officer") {
    redirect("/login");
  }

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-night-panel flex flex-col">
        <div className="px-4 py-3 border-b border-[rgba(240,233,217,0.14)]">
          <p className="text-[10px] font-bold text-accent-400 uppercase tracking-widest">
            Admin Panel
          </p>
          <p className="text-xs text-sage-300 mt-0.5 truncate font-medium">
            {user.name ?? user.email}
          </p>
        </div>
        <AdminSidebarNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-neutral-100 overflow-auto">
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}
