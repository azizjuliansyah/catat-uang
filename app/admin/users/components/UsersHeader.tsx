"use client";

import { Button } from "@/components/ui/atoms/Button";
import { Plus } from "lucide-react";

interface UsersHeaderProps {
  onCreateClick: () => void;
}

export function UsersHeader({ onCreateClick }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight font-display">Kelola Pengguna</h1>
        <p className="text-xs text-text-secondary mt-1">Kelola akun pengguna, status aktif/nonaktif, dan akses.</p>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={onCreateClick}
        className="flex-1 sm:flex-initial"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Buat Pengguna
      </Button>
    </div>
  );
}
