"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";

interface ProfileFormProps {
  userEmail?: string | null;
  profileName: string;
  onProfileNameChange: (value: string) => void;
  onAvatarUpload: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isUploading: boolean;
}

export function ProfileForm({
  userEmail,
  profileName,
  onProfileNameChange,
  onAvatarUpload,
  onSubmit,
  isSaving,
  isUploading,
}: ProfileFormProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Informasi Profil
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
        {/* Avatar Upload Button */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">
            Foto Profil
          </label>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isUploading}
            disabled={isSaving || isUploading}
            onClick={onAvatarUpload}
            className="px-4 py-2.5 text-xs font-medium"
          >
            {isUploading ? "Mengunggah..." : "Ubah Foto Profil"}
          </Button>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            Nama Lengkap
            <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Masukkan nama lengkap"
            disabled={isSaving || isUploading}
            className="w-full px-3.5 py-2.5 bg-surface-input border rounded-xl text-xs text-text-primary outline-none transition-all focus-glow border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email Display (Read-only) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">
            Email
          </label>
          <div className="w-full px-3.5 py-2.5 bg-surface-input border border-border rounded-xl text-xs text-text-muted font-mono">
            {userEmail || "email@contoh.com"}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSaving || isUploading}
            disabled={isSaving || isUploading || !profileName.trim()}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            {isSaving ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </div>
      </form>
    </div>
  );
}
