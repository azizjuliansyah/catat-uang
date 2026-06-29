"use client";

import { Mail, User } from "lucide-react";
import { FormField } from "@/components/ui/molecules/FormField";
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

      {/* Avatar Upload Button */}
      <div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          isLoading={isUploading}
          disabled={isSaving || isUploading}
          onClick={onAvatarUpload}
          className="px-4 py-2"
        >
          {isUploading ? "Mengunggah..." : "Ubah Foto Profil"}
        </Button>
      </div>

      {/* Name Field */}
      <FormField
        label="Nama Lengkap"
        required
        value={profileName}
        onChange={(e) => onProfileNameChange(e.target.value)}
        placeholder="Masukkan nama lengkap"
        disabled={isSaving || isUploading}
      />

      {/* Email Display (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </label>
        <div className="w-full px-4 py-2.5 bg-surface-hover border border-border rounded-lg text-text-muted font-mono">
          {userEmail || "email@contoh.com"}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          isLoading={isSaving || isUploading}
          disabled={isSaving || isUploading || !profileName.trim()}
          onClick={onSubmit}
          className="px-6 py-2.5"
        >
          {isSaving ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>
    </div>
  );
}
