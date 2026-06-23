"use client";

import { FolderMinus } from "lucide-react";

export function CategoriesEmptyState() {
  return (
    <div className="bg-surface-card border border-border border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-hover text-text-secondary/40">
        <FolderMinus className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-text-primary">
        Belum ada template
      </h3>
      <p className="text-xs text-text-secondary max-w-xs mx-auto">
        Tambahkan template baru untuk mempermudah pengguna memisahkan transaksi mereka.
      </p>
    </div>
  );
}
