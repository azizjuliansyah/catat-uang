"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Receipt } from "lucide-react";

interface DebtsEmptyStateProps {
  searchTerm: string;
  activeTab: "owe" | "lend";
  subTab: "active" | "settled";
  onAddClick: () => void;
}

export function DebtsEmptyState({
  searchTerm,
  activeTab,
  subTab,
  onAddClick,
}: DebtsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-border rounded-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary/40 mb-3">
        <Receipt className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-text-primary">Tidak ada catatan ditemukan</h3>
      <p className="text-xs text-text-secondary mt-1 max-w-sm">
        {searchTerm
          ? "Coba ganti kata kunci pencarian Anda."
          : `Belum ada catatan ${activeTab === "owe" ? "hutang" : "piutang"} ${subTab === "active" ? "aktif" : "lunas"} Anda.`}
      </p>
      {!searchTerm && subTab === "active" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddClick}
          className="mt-4 text-xs text-primary font-bold hover:underline cursor-pointer min-h-0 py-1 px-2"
        >
          Tambah catatan baru →
        </Button>
      )}
    </div>
  );
}
