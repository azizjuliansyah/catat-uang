"use client";

import { Settings as SettingsIcon } from "lucide-react";

export function AdminSettingsHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2 font-display">
        <SettingsIcon className="w-6 h-6 text-warning" />
        Pengaturan Admin
      </h1>
      <p className="text-xs text-text-secondary mt-1">
        Kelola profil administrator dan keamanan akun Anda.
      </p>
    </div>
  );
}
