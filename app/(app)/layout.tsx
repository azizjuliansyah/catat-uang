"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Receipt,
  Target,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Menu,
  X,
  Plus
} from "lucide-react";

interface WalletItem {
  id: string;
  name: string;
  balance: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
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

  // Fetch user session on mount
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    }
    loadUser();
  }, [supabase, router]);

  // Fetch wallets on mount and when pathname changes
  useEffect(() => {
    async function loadWallets() {
      const { data: walletData, error } = await supabase
        .from("wallets")
        .select("id, name, balance")
        .order("name", { ascending: true });

      if (!error && walletData) {
        setWallets(walletData);
      }
    }
    loadWallets();
  }, [supabase, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
    { name: "Dompet", href: "/wallets", icon: Wallet },
    { name: "Hutang", href: "/debts", icon: Receipt },
    { name: "Tabungan", href: "/goals", icon: Target },
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight">
              Catat<span className="text-primary font-bold">Uang</span>
            </span>
          </div>
        </div>

        {/* Wallet Switcher Dropdown */}
        <div className="px-4 py-4 border-b border-border relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 bg-surface-input hover:bg-surface-hover border border-border hover:border-border-strong rounded-lg text-left transition-colors cursor-pointer"
          >
            <div className="overflow-hidden">
              <p className="text-xs text-text-secondary font-medium truncate">
                {currentWalletName}
              </p>
              <p className="text-sm font-semibold text-text-primary font-mono truncate mt-0.5">
                {formatIDR(currentWalletBalance)}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary shrink-0 ml-2" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-surface-input border border-border rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedWalletId("all");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-hover transition-colors flex flex-col ${
                  selectedWalletId === "all" ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-text-primary"
                }`}
              >
                <span className="font-medium">Semua Dompet</span>
                <span className="text-xxs font-mono text-text-secondary mt-0.5">{formatIDR(totalBalance)}</span>
              </button>
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setSelectedWalletId(w.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-surface-hover transition-colors flex flex-col ${
                    selectedWalletId === w.id ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-text-primary"
                  }`}
                >
                  <span className="font-medium truncate">{w.name}</span>
                  <span className="text-xxs font-mono text-text-secondary mt-0.5">{formatIDR(w.balance)}</span>
                </button>
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
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              {user?.email ? user.email[0].toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-text-primary truncate">
                {user?.user_metadata?.name || "Pengguna"}
              </p>
              <p className="text-xxs text-text-secondary truncate">
                {user?.email || "loading..."}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR & BOTTOM NAVBAR */}
      <div className="flex flex-col flex-1 md:pl-60 min-w-0">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between h-14 px-4 bg-surface-card border-b border-border sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-semibold text-md text-text-primary tracking-tight">
              CatatUang
            </span>
          </div>

          {/* Quick Wallet Indicator / switcher on header */}
          <div className="text-right">
            <span className="text-xxs text-text-secondary block">Saldo Total</span>
            <span className="text-xs font-semibold text-text-primary font-mono block">
              {formatIDR(totalBalance)}
            </span>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 pb-20 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-card/90 backdrop-blur-md border-t border-border items-center justify-around px-2 z-40 shadow-lg">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
                  isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-xxs font-medium tracking-tight truncate">
                  {item.name}
                </span>
              </a>
            );
          })}
          {/* Quick Sign Out for Mobile */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-text-secondary hover:text-danger cursor-pointer"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span className="text-xxs font-medium tracking-tight">Keluar</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
