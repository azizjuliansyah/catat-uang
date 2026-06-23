"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Plus } from "lucide-react";

interface CategoriesHeaderProps {
  onCreateClick: () => void;
}

export function CategoriesHeader({ onCreateClick }: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Template Kategori</h1>
        <p className="text-xs text-text-secondary mt-1">Kelola template kategori global yang dapat disinkronkan oleh pengguna.</p>
      </div>

      <Button
        onClick={onCreateClick}
        variant="primary"
        size="sm"
      >
        <Plus className="w-4 h-4" />
        Template Baru
      </Button>
    </div>
  );
}
