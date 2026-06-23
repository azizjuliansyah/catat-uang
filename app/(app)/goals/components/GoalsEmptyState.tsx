"use client";

import { Button } from "@/components/ui/atoms/Button";
import { PiggyBank } from "lucide-react";

interface GoalsEmptyStateProps {
  searchTerm: string;
  statusFilter: string;
  onAddClick: () => void;
}

export function GoalsEmptyState({
  searchTerm,
  statusFilter,
  onAddClick,
}: GoalsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-text-secondary/40 mb-3">
        <PiggyBank className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-text-primary">Tidak ada target tabungan</h3>
      <p className="text-xs text-text-secondary mt-1 max-w-sm">
        {searchTerm
          ? "Coba ganti kata kunci pencarian Anda."
          : "Mulai buat target impian baru dan kelola tabungan Anda."}
      </p>
      {!searchTerm && statusFilter === "all" && (
        <Button
          onClick={onAddClick}
          variant="ghost"
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer p-0 h-auto min-h-0 bg-transparent border-transparent"
        >
          Tambah target pertama Anda →
        </Button>
      )}
    </div>
  );
}
