import { useState, useEffect, useCallback, useRef } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/molecules/Toast";
import { updateUserAvatar, updateUserName } from "@/app/actions/users";

interface UseProfileActionsParams {
  user: any;
  supabase: SupabaseClient;
  refreshUser: () => Promise<void>;
}

export function useProfileActions({
  user,
  supabase,
  refreshUser,
}: UseProfileActionsParams) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        setLoadingProfile(true);
        const { data: prof } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setProfileName(prof.name || "");
          const url = prof.avatar_url || "";
          const finalUrl = url ? (url.includes('?') ? url : `${url}?t=${Date.now()}`) : "";
          setAvatarUrl(finalUrl);
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

  // Get error message from error object
  function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      if ('message' in err && typeof err.message === 'string') return err.message;
      if ('error' in err && typeof err.error === 'object' && err.error) {
        if ('message' in err.error && typeof err.error.message === 'string') return err.error.message;
      }
      try {
        return JSON.stringify(err);
      } catch {
        return 'Unknown error';
      }
    }
    if (err instanceof Error) return err.message;
    return String(err);
  }

  // Handle profile save
  const handleProfileSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!profileName.trim()) {
      showErrorToast("Nama lengkap tidak boleh kosong");
      return;
    }

    setProfileSaving(true);
    try {
      await updateUserName(profileName.trim());
      await refreshUser();
      showSuccessToast("Profil berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      showErrorToast("Gagal memperbarui profil: " + getErrorMessage(err));
    } finally {
      setProfileSaving(false);
    }
  }, [user, profileName, refreshUser, showSuccessToast, showErrorToast]);

  // Upload photo logic
  const uploadPhoto = useCallback(async (file: File) => {
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

      const avatarUrlWithCache = `${publicUrl}?t=${Date.now()}`;
      await updateUserAvatar(avatarUrlWithCache);
      setAvatarUrl(avatarUrlWithCache);
      await refreshUser();
      showSuccessToast("Foto profil berhasil diperbarui!");
    } catch (err: unknown) {
      console.error("Error uploading avatar:", err);
      showErrorToast("Gagal mengunggah foto profil: " + getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }, [user, supabase, refreshUser, showSuccessToast, showErrorToast]);

  // Handle avatar input change
  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  }, [uploadPhoto]);

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  }, [uploadPhoto]);

  return {
    // State
    profileName,
    setProfileName,
    avatarUrl,
    uploading,
    profileSaving,
    loadingProfile,
    isDragOver,
    fileInputRef,

    // Handlers
    handleProfileSave,
    handleAvatarUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
