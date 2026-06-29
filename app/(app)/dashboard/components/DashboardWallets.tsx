"use client";

import { Wallet, ChevronRight } from "lucide-react";
import { getIconComponent } from "@/lib/utils/icons";
import { DynamicColorIcon } from "@/components/ui/atoms/DynamicColorIcon";
import { DetailLink } from "@/components/ui/atoms/DetailLink";

interface WalletItem {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  is_default: boolean;
  is_archived: boolean;
}

interface DashboardWalletsProps {
  wallets: WalletItem[];
  isLoading?: boolean;
}

export function DashboardWallets({ wallets, isLoading = false }: DashboardWalletsProps) {
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 font-display">
          <Wallet className="w-3.5 h-3.5 text-primary" />
          Dompet Saya
        </h2>
        <DetailLink
          href="/wallets"
          label="Lihat Semua"
          icon={ChevronRight}
          iconPosition="right"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          // Skeleton items
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-card border border-border/80 rounded-2xl px-4 py-2 relative overflow-hidden animate-pulse"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-surface-hover shrink-0" />
                  <div className="min-w-0 space-y-2">
                    <div className="h-3.5 w-24 bg-surface-hover rounded" />
                    <div className="h-2.5 w-20 bg-surface-hover rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-surface-hover rounded" />
              </div>
              <div className="mt-2 pt-1 border-t border-border/50">
                <div className="h-3 w-16 bg-surface-hover rounded ml-auto" />
              </div>
            </div>
          ))
        ) : (
          wallets.map((wallet) => {
          const WalletIconComponent = getIconComponent(wallet.icon);
          return (
            <div
              key={wallet.id}
              className="bg-surface-card border border-border/80 hover:border-border-strong rounded-2xl px-4 py-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5 select-none"
              style={{
                "--wallet-color": wallet.color,
                "--wallet-color-bg": `${wallet.color}05`,
                "--wallet-color-bg-hover": `${wallet.color}12`,
              } as React.CSSProperties}
            >
              {/* Left Accent Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--wallet-color)] opacity-40 group-hover:opacity-90 transition-all duration-300" />

              {/* Top-right subtle radial ambient glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 100% 0%, ${wallet.color}12, transparent 50%)`
                }}
              />

              <div className="flex items-center justify-between relative z-10 w-full">
                <div className="flex items-center gap-3.5 min-w-0">
                  <DynamicColorIcon icon={WalletIconComponent} color={wallet.color} size="md" variant="light" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate transition-colors group-hover:text-[var(--wallet-color)]">
                      {wallet.name}
                    </p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      {wallet.is_default ? "Dompet Utama" : "Dompet Aktif"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-text-primary">
                    {formatIDR(wallet.balance)}
                  </p>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="mt-2 pt-1 border-t border-border/50 flex justify-end relative z-10">
                <DetailLink href={`/wallets/${wallet.id}`} />
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
