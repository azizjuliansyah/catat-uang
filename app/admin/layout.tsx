"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/atoms/Button";
import {
  ShieldAlert,
  Users,
  FileText,
  LogOut,
  LayoutDashboard,
  ChevronRight
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.app_metadata?.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(user);
    }
    loadAdminData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Kelola Pengguna", href: "/admin/users", icon: Users },
    { name: "Audit Log", href: "/admin/audit-log", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface border-t-4 border-warning">
      {/* Admin Top Bar */}
      <header className="h-16 border-b border-border bg-surface-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary min-h-0 h-auto"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center text-zinc-950 font-bold">
              A
            </div>
            <span className="font-semibold text-text-primary hidden sm:block">
              CatatUang <span className="text-warning font-bold">Admin Panel</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary font-mono hidden sm:block">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-danger rounded-md text-xs font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer min-h-0 h-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col w-56 bg-surface-card border-r border-border shrink-0`}>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-warning/10 text-warning border-l-2 border-warning"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-warning" : "text-text-secondary"}`} />
                  {item.name}
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning leading-relaxed">
                  Mode Admin: Semua tindakan dicatat dalam audit log.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-surface/95 backdrop-blur-sm">
            <div className="p-4 space-y-2 pt-20">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-warning/10 text-warning"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-warning" : "text-text-secondary"}`} />
                    {item.name}
                  </a>
                );
              })}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium rounded-xl text-danger hover:text-danger hover:bg-danger/10 transition-all min-h-0 h-auto"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
