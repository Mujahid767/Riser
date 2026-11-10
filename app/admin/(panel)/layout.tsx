import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar email={session.email} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-admin-border bg-admin-card flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold text-white tracking-widest">RISER</span>
            <span className="text-neutral-600 text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              View Store ↗
            </a>
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
