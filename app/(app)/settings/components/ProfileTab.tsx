"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/app/providers/AppProvider";
import { useToast } from "@/components/ui/molecules/Toast";
import { FormField } from "@/components/ui/molecules/FormField";
import { Button } from "@/components/ui/atoms/Button";
import { SkeletonProfile } from "@/components/ui/organisms/SkeletonLoading";
import { User, UploadCloud } from "lucide-react";

export function ProfileTab() {
  const supabase = createClient();
  const { user, refreshUser } = useApp();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Drag and drop zone hover state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        setLoadingProfile(true);
        // Fetch user profile from public.users table
        const { data: prof } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setProfileName(prof.name || "");
          setAvatarUrl(prof.avatar_url || "");
        } else {
          setProfileName(user.user_metadata?.name || user.email || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [user, supabase]);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // Handle Profile Update
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!profileName.trim()) {
      showErrorToast("Nama lengkap tidak boleh kosong");
      return;
    }

    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: profileName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { name: profileName.trim() }
      });

      await refreshUser();
      showSuccessToast("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      showErrorToast("Gagal memperbarui profil: " + getErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  }

  // Upload Photo File logic
  const uploadPhoto = async (file: File) => {
    if (!user) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showErrorToast("Format file harus JPEG, PNG, atau WEBP");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast("Ukuran file maksimal adalah 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update in users table
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      await refreshUser();
      setAvatarUrl(publicUrl);
      showSuccessToast("Foto profil berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Error uploading avatar:", err);
      showErrorToast("Gagal mengunggah foto profil: " + getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // Handle Avatar Input change
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  };

  if (loadingProfile) {
    return <SkeletonProfile />;
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
      <h2 className="text-base font-bold text-text-primary font-display border-b border-border/40 pb-3">Profil Pengguna</h2>
      
      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Photo Upload Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary block">Foto Profil</label>
          
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 border border-border/50 rounded-2xl bg-surface/30">
            {/* Photo Circular Preview */}
            <div className="relative group shrink-0 w-24 h-24 rounded-full overflow-hidden border border-border bg-surface-input flex items-center justify-center text-text-secondary text-2xl font-bold font-mono">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profileName ? profileName[0].toUpperCase() : <User className="w-8 h-8" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold animate-pulse">Uploading...</span>
                </div>
              )}
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border-strong bg-surface-input/30 hover:bg-surface-hover/20"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <UploadCloud className={`w-6 h-6 ${isDragOver ? "text-primary animate-bounce" : "text-text-secondary"}`} />
              <p className="text-xs font-bold text-text-primary">
                Seret & taruh foto di sini, atau klik untuk memilih
              </p>
              <p className="text-[10px] text-text-secondary">
                Format JPG, PNG, atau WEBP. Ukuran Maksimum 2MB (1:1 direkomendasikan).
              </p>
            </div>
          </div>
        </div>

        {/* Email (Readonly) */}
        <FormField
          label="Alamat Email (Tidak dapat diubah)"
          type="email"
          readOnly
          value={user?.email || ""}
        />

        {/* Full Name */}
        <FormField
          label="Nama Lengkap"
          required
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Masukkan nama lengkap Anda"
        />

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={profileSaving || uploading}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
