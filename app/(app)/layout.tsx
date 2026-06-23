"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { Spinner } from "@/components/ui/atoms/Spinner";
import { Button } from "@/components/ui/atoms/Button";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Receipt,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Menu,
  X,
  Plus
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, wallets, loadingUser } = useApp();

  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Redirect to login if user is not logged in, or to admin if the user is an administrator
  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else if (user.app_metadata?.role === "admin") {
        router.push("/admin");
      }
    }
  }, [user, loadingUser, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <p className="text-xs text-text-secondary animate-pulse font-sans">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
    { name: "Dompet", href: "/wallets", icon: Wallet },
    { name: "Paylater", href: "/paylater", icon: CreditCard },
    { name: "Hutang", href: "/debts", icon: Receipt },
    { name: "Tabungan", href: "/goals", icon: Target },
    { name: "Laporan", href: "/reports", icon: TrendingUp },
  ];

  // Calculate total balance for 'Semua Dompet'
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  // Get current active wallet details
  const activeWallet = wallets.find((w) => w.id === selectedWalletId);
  const currentWalletName = selectedWalletId === "all" ? "Semua Dompet" : activeWallet?.name || "Dompet";
  const currentWalletBalance = selectedWalletId === "all" ? totalBalance : activeWallet?.balance || 0;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-60 bg-surface-card border-r border-border shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Branding */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/icon-192x192.png" alt="CatatUang" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight">
              Catat<span className="text-primary font-bold">Uang</span>
            </span>
          </div>
        </div>

        {/* Wallet Switcher Dropdown */}
        <div className="px-4 py-4 border-b border-border relative" ref={dropdownRef}>
          <Button
            variant="secondary"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-br from-surface-input to-surface-card hover:from-surface-hover hover:to-surface-input border border-border/60 hover:border-border-strong/80 rounded-xl text-left transition-all cursor-pointer font-normal min-h-0 h-auto"
          >
            <div className="overflow-hidden flex-1">
              <p className="text-xs text-text-secondary/80 font-medium truncate">
                {currentWalletName}
              </p>
              <p className="text-sm font-semibold text-text-primary font-mono truncate mt-0.5">
                {formatIDR(currentWalletBalance)}
              </p>
            </div>
            <div className="shrink-0 pl-3 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </div>
          </Button>

          {dropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-surface-input border border-border rounded-xl z-50 py-1.5 max-h-60 overflow-y-auto">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedWalletId("all");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-hover transition-colors flex flex-col items-start min-h-0 h-auto font-normal rounded-none ${
                  selectedWalletId === "all" ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-text-primary"
                }`}
              >
                <span className="font-medium">Semua Dompet</span>
                <span className="text-xs font-mono text-text-secondary mt-0.5">{formatIDR(totalBalance)}</span>
              </Button>
              {wallets.map((w) => (
                <Button
                  key={w.id}
                  variant="ghost"
                  onClick={() => {
                    setSelectedWalletId(w.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-hover transition-colors flex flex-col items-start min-h-0 h-auto font-normal rounded-none ${
                    selectedWalletId === w.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-text-primary"
                  }`}
                >
                  <span className="font-medium truncate">{w.name}</span>
                  <span className="text-xs font-mono text-text-secondary mt-0.5">{formatIDR(w.balance)}</span>
                </Button>
              ))}
              {wallets.length === 0 && (
                <div className="px-4 py-3 text-center text-xs text-text-muted">
                  Belum ada dompet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-secondary"}`} />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Bottom Section (User profile & actions) */}
        <div className="p-4 border-t border-border bg-surface-card/50">
          <div className="flex items-center justify-between gap-2 mb-3 px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : user?.email ? (
                  <span className="text-xs font-bold text-primary">
                    {user.email[0].toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {user?.user_metadata?.name || "Pengguna"}
                </p>
                <p className="text-[10px] text-text-secondary/70 truncate">
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
            href="/settings"
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary border-l-2 border-primary font-bold"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          >
            <Settings className={`w-4 h-4 ${pathname.startsWith("/settings") ? "text-primary" : "text-text-secondary"}`} />
            Pengaturan
          </a>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR & BOTTOM NAVBAR */}
      <div className="flex flex-col flex-1 md:pl-60 min-w-0">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between h-16 px-4 border-b border-border/50 sticky top-0 z-20 glassmorphism">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/icon-192x192.png" alt="CatatUang" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-base text-text-primary tracking-tight font-display">
              Catat<span className="text-primary">Uang</span>
            </span>
          </div>

          {/* Quick Wallet Indicator / switcher, Settings, & Logout on header */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-text-secondary block font-medium">Saldo Total</span>
              <span className="text-xs font-semibold text-text-primary font-mono block">
                {formatIDR(totalBalance)}
              </span>
            </div>

            <a
              href="/settings"
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${
                pathname.startsWith("/settings")
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-text-secondary hover:text-text-primary bg-surface-input/50 hover:bg-surface-hover/50 border-border"
              }`}
              aria-label="Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </a>

            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all border text-text-secondary hover:text-danger hover:bg-danger/10 border-border bg-surface-input/50"
              aria-label="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 pb-24 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/50 items-center justify-around px-2 z-40 glassmorphism pb-[env(safe-area-inset-bottom,0)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-all relative ${
                  isActive ? "text-primary font-bold" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 text-primary" : "text-text-secondary"}`} />
                <span className="text-[10px] tracking-tight mt-0.5 font-sans">
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(0,114,245,0.6)] animate-fade-in" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
