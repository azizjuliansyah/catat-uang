"use client";

import { User, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/atoms/Button";
import { FormField } from "@/components/ui/molecules/FormField";
import { Input } from "@/components/ui/atoms/Input";

interface ProfileFormProps {
  userEmail?: string | null;
  profileName: string;
  avatarUrl: string | null;
  onProfileNameChange: (value: string) => void;
  onAvatarUpload: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isUploading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function ProfileForm({
  userEmail,
  profileName,
  avatarUrl,
  onProfileNameChange,
  onAvatarUpload,
  onSubmit,
  isSaving,
  isUploading,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: ProfileFormProps) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Informasi Profil
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-5">
        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary">
            Foto Profil
          </label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onAvatarUpload}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface-input/50"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* Avatar Preview */}
            <div className="flex justify-center mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-surface"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center border-4 border-surface">
                  <ImageIcon className="w-10 h-10 text-text-muted" />
                </div>
              )}
            </div>

            {/* Upload Text */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                {isUploading ? "Mengunggah..." : "Drag & drop foto di sini"}
              </p>
              <p className="text-xs text-text-muted">
                atau <span className="text-primary hover:underline">klik untuk memilih</span>
              </p>
              <p className="text-[10px] text-text-muted mt-2">
                PNG, JPG, atau WEBP (maks. 2MB)
              </p>
            </div>

            {/* Upload Icon Overlay on Drag */}
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-xl">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">Lepaskan untuk mengunggah</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Name Field */}
        <FormField
          label="Nama Lengkap"
          required
        >
          <Input
            type="text"
            value={profileName}
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Masukkan nama lengkap"
            disabled={isSaving || isUploading}
          />
        </FormField>

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
