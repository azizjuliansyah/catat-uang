"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Wallet as DefaultWalletIcon, Search } from "lucide-react";

interface WalletsEmptyStateProps {
  activeTab: "active" | "archived";
  onAddClick: () => void;
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function WalletsEmptyState({
  activeTab,
  onAddClick,
  searchTerm = "",
  onClearSearch
}: WalletsEmptyStateProps) {
  const isSearchActive = searchTerm.trim().length > 0;

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl bg-surface-card/50 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-surface-hover flex items-center justify-center text-text-muted mb-4">
        {isSearchActive ? (
          <Search className="w-7 h-7" />
        ) : (
          <DefaultWalletIcon className="w-7 h-7" />
        )}
      </div>
      <h3 className="text-section-title text-text-primary font-display mb-2">
        {isSearchActive ? "Tidak ada hasil pencarian" : "Tidak ada dompet ditemukan"}
      </h3>
      <p className="text-body text-text-secondary max-w-sm mb-6">
        {isSearchActive
          ? `Kami tidak menemukan dompet dengan nama "${searchTerm}". Silakan bersihkan pencarian atau coba kata kunci lain.`
          : activeTab === "active"
            ? "Tambahkan dompet pertama Anda untuk mulai mencatat dan mengelola keuangan Anda."
            : "Belum ada dompet yang Anda arsipkan."}
      </p>
      {isSearchActive ? (
        onClearSearch && (
          <Button
            variant="secondary"
            size="md"
            onClick={onClearSearch}
          >
            Bersihkan Pencarian
          </Button>
        )
      ) : (
        activeTab === "active" && (
          <Button
            variant="secondary"
            size="md"
            onClick={onAddClick}
          >
            Tambah Dompet Baru
          </Button>
        )
      )}
    </div>
  );
}
