import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/server-auth";
import AdminSidebarNav from "./_components/AdminSidebarNav";

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
      <aside className="w-52 shrink-0 bg-green-900 flex flex-col">
        <div className="px-4 py-3 border-b border-green-800">
          <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
            Admin Panel
          </p>
          <p className="text-xs text-green-200 mt-0.5 truncate font-medium">
            {user.name ?? user.email}
          </p>
        </div>
        <AdminSidebarNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-gray-50 overflow-auto">
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}
