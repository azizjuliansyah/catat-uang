"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { Spinner } from "@/components/ui/atoms/Spinner";
import { Button } from "@/components/ui/atoms/Button";
import {
  ShieldAlert,
  Users,
  FileText,
  LogOut,
  LayoutDashboard,
  ArrowRightLeft,
  User,
  Settings
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { user, loadingUser } = useApp();

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.app_metadata?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loadingUser, router]);

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

  if (loadingUser || !user || user.app_metadata?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-warning" />
          <p className="text-xs text-text-secondary animate-pulse font-sans">Memuat sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-60 bg-surface-card border-r border-border shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center text-zinc-950 font-bold text-lg">
              A
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight">
              Catat<span className="text-warning font-bold">Uang</span>{" "}
              <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Admin
              </span>
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
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

        {/* Bottom Section (User profile & actions) */}
        <div className="p-4 border-t border-border bg-surface-card/50">
          <div className="flex items-center justify-between gap-2 mb-3 px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0 font-bold">
                {user?.email ? user.email[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {user?.user_metadata?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-text-secondary/70 truncate font-mono">
                  {user?.email || "loading..."}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar Aplikasi"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/admin/settings"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          >
            <Settings className="w-4 h-4 text-text-secondary" />
            Pengaturan
          </a>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR & BOTTOM NAVBAR */}
      <div className="flex flex-col flex-1 md:pl-60 min-w-0">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between h-16 px-4 border-b border-border/50 sticky top-0 z-20 glassmorphism">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center text-zinc-950 font-bold text-base shadow-lg shadow-warning/25">
              A
            </div>
            <span className="font-bold text-base text-text-primary tracking-tight font-display">
              Catat<span className="text-warning">Uang</span>{" "}
              <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Admin
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] font-bold text-warning uppercase tracking-wider block">Mode Admin</span>
              <span className="text-[10px] text-text-secondary block truncate max-w-[120px] font-mono">
                {user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 pb-24 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/50 items-center justify-around px-2 z-40 shadow-xl glassmorphism pb-[env(safe-area-inset-bottom,0)]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-all relative ${
                  isActive ? "text-warning font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 text-warning" : "text-text-secondary"
                  }`}
                />
                <span className="text-[10px] tracking-tight mt-0.5 font-sans">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-fade-in" />
                )}
              </a>
            );
          })}

          <a
            href="/admin/settings"
            className="flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-all text-text-secondary hover:text-text-primary"
          >
            <Settings className="w-5 h-5 text-text-secondary" />
            <span className="text-[10px] tracking-tight mt-0.5 font-sans">Pengaturan</span>
          </a>

          {/* Quick Sign Out for Mobile */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 min-h-0 text-text-secondary hover:text-danger transition-colors font-normal rounded-none cursor-pointer active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5 font-sans">Keluar</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

